// georgiasweeny.com Worker. Pages and images are static files served by Cloudflare
// before this runs; only /api/* reaches it (see run_worker_first in wrangler.jsonc).
//
// POST /api/contact: honeypot + Cloudflare Turnstile, then emails the message to Georgia.
// Secrets (Cloudflare dashboard → the Worker → Settings → Variables and Secrets):
//   TURNSTILE_SECRET  the Turnstile widget's secret key
//   CONTACT_TO        Georgia's own inbox (a verified Email Routing destination address)

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const clean = (s, max) => String(s ?? "").replace(/\r/g, "").trim().slice(0, max);

async function contact(request, env) {
  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: "Something went wrong." }, 400); }
  if (form.get("website")) return json({ ok: true }); // honeypot filled in: a bot, pretend it worked

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 200);
  const message = clean(form.get("message"), 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Please fill in your name, a valid email and a message." }, 400);
  }

  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET,
      response: form.get("cf-turnstile-response") || "",
      remoteip: request.headers.get("CF-Connecting-IP") || "",
    }),
  }).then((r) => r.json()).catch(() => ({ success: false }));
  if (!verify.success) {
    const codes = (verify["error-codes"] || []).join(", ") || "no reply";
    console.error("turnstile failed", codes, verify.hostname || "");
    return json({ ok: false, error: `The spam check didn’t pass (${codes}). Please try again.` }, 403);
  }

  try {
    await env.EMAIL.send({
      from: { email: env.CONTACT_FROM, name: "georgiasweeny.com" },
      to: env.CONTACT_TO,
      replyTo: { email, name },
      subject: `Portfolio message from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `From: ${name} <${email}>\n\n${message}\n\n— sent from the contact form on georgiasweeny.com`,
    });
  } catch (err) {
    console.error("send failed", err.code, err.message);
    return json({ ok: false, error: "Sorry, the message couldn’t be sent just now." }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return contact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
