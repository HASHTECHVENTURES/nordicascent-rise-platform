import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailBody = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Partial<EmailBody> & { healthcheck?: boolean };

    // Safe readiness probe — reports whether Resend is configured without
    // sending any email. Used by ops to confirm production email is wired.
    if (body.healthcheck === true) {
      return new Response(
        JSON.stringify({
          ok: true,
          healthcheck: true,
          resendConfigured: Boolean(Deno.env.get("RESEND_API_KEY")),
          from: Deno.env.get("TRANSACTIONAL_EMAIL_FROM") ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, text } = body as EmailBody;

    if (!to?.trim() || !subject?.trim() || !html?.trim()) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, reason: "RESEND_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const from =
      Deno.env.get("TRANSACTIONAL_EMAIL_FROM") ?? "Nordic Ascent <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to.trim()],
        subject: subject.trim(),
        html,
        text: text?.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ ok: false, reason: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, reason: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
