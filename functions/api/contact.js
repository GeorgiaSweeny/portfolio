// POST /api/contact — Cloudflare Pages Function behind the contact form.
// 1. rejects bots (honeypot field + Cloudflare Turnstile), 2. validates,
// 3. emails the message to Georgia through Cloudflare Email Routing.
//
// Needs, in the Pages project settings (set up with the Cloudflare account):
//   TURNSTILE_SECRET   secret key from the Turnstile widget
//   SEND_EMAIL         a "send_email" binding, destination = the verified hello@ forwarding address
//   CONTACT_FROM       a sender on the domain, e.g. form@georgiasweeny.com
//   CONTACT_TO         the verified destination address (never shown on the site)
// NOT YET TESTED: needs the Cloudflare account. If Pages won't take the send_email
// binding, this moves into a tiny Worker unchanged.
import { EmailMessage } from "cloudflare:email";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const clean = (s, max) => String(s ?? "").replace(/\r/g, "").trim().slice(0, max);
const header = (s) => s.replace(/[\r\n]+/g, " ");

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (form.get("website")) return json({ ok: true }); // honeypot: pretend it worked

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
  if (!verify.success) return json({ ok: false, error: "The spam check didn’t pass. Please try again." }, 403);

  const raw = [
    `From: Portfolio contact form <${env.CONTACT_FROM}>`,
    `To: <${env.CONTACT_TO}>`,
    `Reply-To: ${header(name)} <${header(email)}>`,
    `Subject: ${header(`Portfolio message from ${name}`)}`,
    `Message-ID: <${crypto.randomUUID()}@${env.CONTACT_FROM.split("@")[1]}>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    `From: ${name} <${email}>`,
    "",
    message,
  ].join("\r\n");

  try {
    await env.SEND_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    console.error("send failed", err);
    return json({ ok: false, error: "Sorry, the message couldn’t be sent just now." }, 502);
  }
  return json({ ok: true });
}
