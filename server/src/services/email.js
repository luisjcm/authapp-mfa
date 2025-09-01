// server/src/services/email.js
const { Resend } = require('resend');

let resend = null;

// Sólo inicializa si hay API key
if (process.env.RESEND_API_KEY && String(process.env.RESEND_API_KEY).trim() !== '') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail({ from, to, subject, html }) {
  if (!resend) {
    throw new Error('Resend no está configurado. Falta RESEND_API_KEY.');
  }
  return resend.emails.send({ from, to, subject, html });
}

function isConfigured() {
  return !!resend;
}

module.exports = { sendEmail, isConfigured };
