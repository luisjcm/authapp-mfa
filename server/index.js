// server/index.js
require('dotenv').config();

const express = require('express');
const { sendEmail, isConfigured } = require('./src/services/email');
const { renderTemplate } = require('./src/utils/templates');

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    emailConfigured: isConfigured(),
    env: process.env.NODE_ENV || 'development',
  });
});

/**
 * Endpoint: Enviar correo de verificación con template
 * Body:
 * {
 *   "to": "correo@destino.com",
 *   "toName": "Luis",             // opcional
 *   "verifyCode": "123456",       // opcional
 *   "verifyLink": "https://...",  // opcional
 *   "codeExpiresIn": 10           // opcional (minutos)
 * }
 */
app.post('/api/send-email/verify', async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: 'Email no configurado (falta RESEND_API_KEY).' });
  }

  try {
    const {
      to,
      toName = 'amigo/a',
      verifyCode = '',
      verifyLink = '',
      codeExpiresIn = 10,
    } = req.body;

    if (!to || (!verifyCode && !verifyLink)) {
      return res.status(400).json({
        ok: false,
        error: 'Faltan campos: "to" y al menos uno entre "verifyCode" o "verifyLink".',
      });
    }

    const now = new Date();
    const html = renderTemplate('verifyEmail.html', {
      appName: process.env.APP_NAME || 'AuthApp',
      userName: toName,
      verifyCode,
      verifyLink,
      codeExpiresIn,
      supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tudominio.com',
      year: now.getFullYear(),
    });

    const subject = verifyCode
      ? `Tu código de verificación: ${verifyCode}`
      : `Verifica tu cuenta en ${process.env.APP_NAME || 'AuthApp'}`;

    const result = await sendEmail({
      from: process.env.FROM_EMAIL || 'AuthApp <no-reply@tudominio.com>',
      to,
      subject,
      html,
    });

console.log('[VERIFY][Resend result]:', JSON.stringify(result, null, 2)); // 👈 debug


    res.json({
      ok: true,
  id: result?.data?.id || result?.id || null, // 👈 más tolerante
      message: 'Email de verificación enviado',
    });
  } catch (err) {
    console.error('Error enviando email (verify):', err);
    const details = err?._resend ? err._resend : undefined;
    res.status(500).json({ ok: false, error: err.message, details });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
});
console.log(`Email configurado: ${isConfigured() ? 'sí' : 'no'}`);