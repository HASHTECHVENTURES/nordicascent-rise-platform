import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randomPassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

type InviteBody = {
  universityId: string;
  name: string;
  email: string;
  portalUrl?: string;
  staffId?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ ok: false, reason: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: caller } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!caller || caller.role !== "admin") {
      return new Response(JSON.stringify({ ok: false, reason: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as InviteBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!body.universityId || !name || !email) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: university, error: uniErr } = await admin
      .from("universities")
      .select("id, name")
      .eq("id", body.universityId)
      .maybeSingle();

    if (uniErr || !university) {
      return new Response(JSON.stringify({ ok: false, reason: "university_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let staffId = body.staffId ?? null;
    if (staffId) {
      const { data: existing } = await admin
        .from("university_staff")
        .select("id, email, name, profile_id")
        .eq("id", staffId)
        .eq("university_id", body.universityId)
        .maybeSingle();
      if (!existing) {
        return new Response(JSON.stringify({ ok: false, reason: "staff_not_found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { data: createdStaff, error: staffErr } = await admin
        .from("university_staff")
        .insert({
          university_id: body.universityId,
          name,
          email,
          status: "active",
        })
        .select("id, profile_id")
        .single();
      if (staffErr || !createdStaff) {
        // Maybe email already exists for this university — reuse
        const { data: byEmail } = await admin
          .from("university_staff")
          .select("id, profile_id, name, email")
          .eq("university_id", body.universityId)
          .ilike("email", email)
          .maybeSingle();
        if (!byEmail) {
          return new Response(
            JSON.stringify({ ok: false, reason: staffErr?.message ?? "staff_create_failed" }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        staffId = byEmail.id;
        await admin
          .from("university_staff")
          .update({ name, status: "active", updated_at: new Date().toISOString() })
          .eq("id", staffId);
      } else {
        staffId = createdStaff.id;
      }
    }

    const { data: staff } = await admin
      .from("university_staff")
      .select("id, name, email, profile_id")
      .eq("id", staffId!)
      .single();

    if (!staff) {
      return new Response(JSON.stringify({ ok: false, reason: "staff_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tempPassword = randomPassword();
    const portalUrl = (body.portalUrl ?? "https://nordicascent.com").replace(/\/$/, "");
    let profileId = staff.profile_id as string | null;

    if (!profileId) {
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
        if (existingProfile.role !== "university" && existingProfile.role !== "admin") {
          await admin.from("profiles").update({ role: "university" }).eq("id", profileId);
        }
        await admin.auth.admin.updateUserById(profileId, {
          password: tempPassword,
          email_confirm: true,
        });
      } else {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "university",
            full_name: name,
          },
        });
        if (createErr || !created.user) {
          return new Response(
            JSON.stringify({
              ok: false,
              reason: createErr?.message ?? "create_user_failed",
            }),
            {
              status: 502,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        profileId = created.user.id;
        await admin.from("profiles").upsert({
          id: profileId,
          email,
          full_name: name,
          role: "university",
          account_status: "active",
          updated_at: new Date().toISOString(),
        });
      }

      await admin
        .from("university_staff")
        .update({
          profile_id: profileId,
          invite_sent_at: new Date().toISOString(),
          invited_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staff.id);
    } else {
      await admin.auth.admin.updateUserById(profileId, {
        password: tempPassword,
        email_confirm: true,
      });
      await admin
        .from("university_staff")
        .update({
          invite_sent_at: new Date().toISOString(),
          invited_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staff.id);
    }

    const subject = `Your Nordic Ascent university portal login — ${university.name}`;
    const text = `Hi ${name},

You have been invited to the Nordic Ascent university portal for ${university.name}.

Use this portal to approve credit internships, monitor academic progress, and award credit. Hiring decisions and Final Clearance are not shared with universities.

Sign in here:
${portalUrl}/login?role=university

Email: ${email}
Temporary password: ${tempPassword}

Please sign in and change your password after first login.

— Nordic Ascent`;

    const html = `<p>Hi ${name},</p>
<p>You have been invited to the Nordic Ascent university portal for <strong>${university.name}</strong>.</p>
<p>Use this portal to approve credit internships, monitor academic progress, and award credit. Hiring decisions and Final Clearance are not shared with universities.</p>
<p><a href="${portalUrl}/login?role=university">Sign in to the university portal</a></p>
<p><strong>Email:</strong> ${email}<br/>
<strong>Temporary password:</strong> ${tempPassword}</p>
<p>Please change your password after first login.</p>
<p>— Nordic Ascent</p>`;

    const apiKey = Deno.env.get("RESEND_API_KEY");
    let emailResult: { ok: boolean; skipped?: boolean; reason?: string } = {
      ok: false,
      skipped: true,
      reason: "RESEND_API_KEY not configured",
    };

    if (apiKey) {
      const from =
        Deno.env.get("TRANSACTIONAL_EMAIL_FROM") ?? "Nordic Ascent <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [email], subject, html, text }),
      });
      if (res.ok) {
        emailResult = { ok: true };
      } else {
        emailResult = { ok: false, reason: await res.text() };
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        staffId: staff.id,
        profileId,
        emailSent: emailResult.ok,
        emailSkipped: emailResult.skipped ?? !emailResult.ok,
        emailReason: emailResult.reason,
        temporaryPassword: emailResult.ok ? undefined : tempPassword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, reason: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
