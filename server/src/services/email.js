const { Resend } = require('resend');

let resend = null;

const RAW_KEY = process.env.RESEND_API_KEY || '';
const API_KEY = RAW_KEY.trim();

const FROM = process.env.RESEND_FROM || 'Acme <onboarding@resend.dev>'; // 👈 remitente fijo

if (API_KEY) {
  const masked = API_KEY.length > 8
    ? API_KEY.slice(0, 4) + '...' + API_KEY.slice(-4)
    : '[short]';
  console.log(`[BOOT] Resend key (masked): ${masked} (len=${API_KEY.length})`);

  resend = new Resend(API_KEY);
}

async function sendEmail({ to, subject, text, html }) {
  if (!resend) {
    throw new Error('Resend no está configurado. Falta RESEND_API_KEY.');
  }

  if (!text && !html) {
    throw new Error('Missing `html` or `text` field.');
  }

  const result = await resend.emails.send({
    from: FROM,   // 👈 usamos remitente fijo
    to,
    subject,
    text,         // 👈 pasamos ambos
    html,
  });

  if (result?.error) {
    const e = new Error(result.error.message || 'Error enviando email (Resend)');
    e._resend = result;
    throw e;
  }
  return result;
}

function isConfigured() {
  return !!resend;
}

module.exports = { sendEmail, isConfigured };
