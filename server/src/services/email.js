// server/src/services/email.js
const { Resend } = require('resend');

let resend = null;

const RAW_KEY = process.env.RESEND_API_KEY || '';
const API_KEY = RAW_KEY.trim(); // 👈 elimina espacios/nuevas líneas

if (API_KEY) {
  // Log enmascarado para debug (no imprime la key completa)
  const masked = API_KEY.length > 8
    ? API_KEY.slice(0, 4) + '...' + API_KEY.slice(-4)
    : '[short]';
  console.log(`[BOOT] Resend key (masked): ${masked} (len=${API_KEY.length})`);

  resend = new Resend(API_KEY);
}

async function sendEmail({ from, to, subject, html }) {
  if (!resend) {
    throw new Error('Resend no está configurado. Falta RESEND_API_KEY.');
  }

  const result = await resend.emails.send({ from, to, subject, html });

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
