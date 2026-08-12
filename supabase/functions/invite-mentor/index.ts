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
  mentorId: string;
  portalUrl?: string;
  candidateName?: string;
  jobTitle?: string;
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

    if (!caller || (caller.role !== "admin" && caller.role !== "employer")) {
      return new Response(JSON.stringify({ ok: false, reason: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as InviteBody;
    if (!body.mentorId) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_mentor_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: mentor, error: mentorErr } = await admin
      .from("company_mentors")
      .select("id, name, email, company_id, profile_id, companies(name)")
      .eq("id", body.mentorId)
      .maybeSingle();

    if (mentorErr || !mentor) {
      return new Response(JSON.stringify({ ok: false, reason: "mentor_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (caller.role === "employer") {
      const { data: emp } = await admin
        .from("employers")
        .select("company_id")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (!emp || emp.company_id !== mentor.company_id) {
        return new Response(JSON.stringify({ ok: false, reason: "forbidden_company" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const email = mentor.email.trim().toLowerCase();
    const tempPassword = randomPassword();
    const portalUrl = (body.portalUrl ?? "https://nordicascent.com").replace(/\/$/, "");
    const companyName =
      (mentor.companies as { name?: string } | null)?.name ?? "your company";

    let profileId = mentor.profile_id as string | null;

    if (!profileId) {
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
        if (existingProfile.role !== "mentor" && existingProfile.role !== "admin") {
          await admin.from("profiles").update({ role: "mentor" }).eq("id", profileId);
        }
        // Reset password so invite email credentials work
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
            role: "mentor",
            full_name: mentor.name,
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
          full_name: mentor.name,
          role: "mentor",
          account_status: "active",
          updated_at: new Date().toISOString(),
        });
      }

      await admin
        .from("company_mentors")
        .update({
          profile_id: profileId,
          invite_sent_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .eq("id", mentor.id);
    } else {
      await admin.auth.admin.updateUserById(profileId, {
        password: tempPassword,
        email_confirm: true,
      });
      await admin
        .from("company_mentors")
        .update({
          invite_sent_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .eq("id", mentor.id);
    }

    const subject = `Your Nordic Ascent mentor login — ${companyName}`;
    const text = `Hi ${mentor.name},

You have been invited as a mentor at ${companyName} on Nordic Ascent${
      body.candidateName ? ` for ${body.candidateName}` : ""
    }${body.jobTitle ? ` (${body.jobTitle})` : ""}.

Sign in here:
${portalUrl}/login?role=mentor

Email: ${email}
Temporary password: ${tempPassword}

Please sign in and change your password after first login.

Mentoring follows a standardised programme with shared agendas and observation forms.

— Nordic Ascent`;

    const html = `<p>Hi ${mentor.name},</p>
<p>You have been invited as a mentor at <strong>${companyName}</strong> on Nordic Ascent${
      body.candidateName ? ` for <strong>${body.candidateName}</strong>` : ""
    }${body.jobTitle ? ` (${body.jobTitle})` : ""}.</p>
<p><a href="${portalUrl}/login?role=mentor">Sign in to the mentor portal</a></p>
<p><strong>Email:</strong> ${email}<br/>
<strong>Temporary password:</strong> ${tempPassword}</p>
<p>Please change your password after first login.</p>
<p>Mentoring follows a standardised programme with shared agendas and observation forms.</p>
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
        profileId,
        emailSent: emailResult.ok,
        emailSkipped: emailResult.skipped ?? !emailResult.ok,
        emailReason: emailResult.reason,
        // Only returned when email could not be sent — caller can show once
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
