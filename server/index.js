// server/index.js (CommonJS)

require('dotenv').config();

const express = require('express');
const { sendEmail, isConfigured } = require('./src/services/email');
const { renderTemplate } = require('./src/utils/templates'); // si no lo usas, puedes removerlo

// Storage simple en memoria (dev). En prod: Redis/DB.
const otpStore = new Map(); // key=email, value={ code, expiresAt: Date }

// ÚNICA definición de generateOtp (no importarla de ningún lado aquí)
function generateOtp(n = 6) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    emailConfigured: isConfigured(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.post("/api/send-email/verify", async (req, res) => {
  try {
    const { to, subject = "Tu código de verificación", expiresInMinutes = 10 } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: 'Falta "to"' });

    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);
    otpStore.set(to.toLowerCase(), { code, expiresAt });

    const text = `Tu código de verificación es: ${code}. Vence en ${expiresInMinutes} minutos.`;
    await sendEmail({
      to,
      subject,
      text,
      // html: renderOtpTemplate({ code, expiresInMinutes }) // si tienes template
    });

    return res.json({
      ok: true,
      message: "OTP enviado",
      ttl: expiresInMinutes * 60,
      to: to.replace(/(.{2}).+(@.*)/, "$1***$2"),
    });
  } catch (e) {
    console.error("Error /api/send-email/verify:", e);
    return res.status(500).json({ ok: false, error: "No se pudo enviar el OTP" });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { to, code } = req.body || {};
    if (!to || !code) return res.status(400).json({ ok: false, error: 'Faltan "to" y/o "code"' });

    const entry = otpStore.get(to.toLowerCase());
    if (!entry) return res.status(400).json({ ok: false, error: "No hay OTP pendiente para este correo" });

    if (new Date() > entry.expiresAt) {
      otpStore.delete(to.toLowerCase());
      return res.status(400).json({ ok: false, error: "OTP expirado" });
    }

    if (String(code) !== String(entry.code)) {
      return res.status(400).json({ ok: false, error: "Código inválido" });
    }

    otpStore.delete(to.toLowerCase());
    return res.json({ ok: true, message: "OTP verificado" });
  } catch (e) {
    console.error("Error verify-otp:", e);
    return res.status(500).json({ ok: false, error: "Error verificando OTP" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
  console.log(`🌐 LAN: http://192.168.1.110:${PORT}`); // opcional, pon tu IP

  console.log(`Email configurado: ${isConfigured() ? 'sí' : 'no'}`);
});
