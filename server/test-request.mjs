// test-request.mjs
function otp(n = 6) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}
const code = otp(6);

const res = await fetch("http://localhost:4000/api/send-email/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "ljcm47@gmail.com",            // <- tu correo permitido por Resend trial
    subject: "Tu código de verificación",
    verifyCode: code,
    text: `Tu código es: ${code}. Vence en 10 minutos.`
  }),
});
console.log("status:", res.status);
console.log(await res.text());
