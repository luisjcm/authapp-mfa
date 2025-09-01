// server/index.js
require('dotenv').config(); // cargar .env primero

const express = require('express');
const { sendEmail, isConfigured } = require('./src/services/email');

const app = express();
app.use(express.json());

// Healthcheck básico
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    emailConfigured: isConfigured(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Endpoint para enviar email
app.post('/api/send-email', async (req, res) => {
  // En dev, si no hay key, responde 503 en lugar de crashear
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: 'Email no configurado (falta RESEND_API_KEY).' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'Faltan campos: to, subject, html' });
    }

    const result = await sendEmail({
      from: process.env.FROM_EMAIL || 'AuthApp <no-reply@tudominio.com>',
      to,
      subject,
      html,
    });

    res.json({
      ok: true,
      id: result?.data?.id || null,
      message: 'Email enviado',
    });
  } catch (err) {
    console.error('Error enviando email:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
});
