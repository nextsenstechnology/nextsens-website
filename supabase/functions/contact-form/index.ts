import { corsHeaders } from "./cors.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

function escapeHtml(text: unknown): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, subject, message, hp_check } = body;

    // Bot defense: Silent honeypot discard
    if (hp_check) {
      console.warn("Spambot submission blocked via honeypot trap.");
      return new Response(JSON.stringify({ message: "Form submitted successfully!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const { data, error } = await resend.emails.send({
      from: "Contact Form <noreply@nextsenstech.com>",
      to: ["info@nextsenstech.com", "nextsenstechnology@gmail.com"],
      reply_to: email,
      subject: `New Contact Form Submission: ${safeSubject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p>You have received a new message from your website contact form.</p>
        <hr>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr>
        <p>This email was sent from the contact form on nextsenstech.com.</p>
      `,
    });

    if (error) {
      console.error({ error });
      return new Response(JSON.stringify({ error: `Failed to send email. Resend Error: ${error.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Form submitted successfully!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});