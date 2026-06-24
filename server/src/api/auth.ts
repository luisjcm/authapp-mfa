// src/api/auth.ts
// @ts-ignore: Metro bundler necesita que no tenga extensión, ignoramos la advertencia de NodeNext
import { API_URL } from "../config";

export async function requestOtp(to: string) {
  console.log("[requestOtp] API_URL =", API_URL, "to =", to);
  const res = await fetch(`${API_URL}/api/send-email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, expiresInMinutes: 10 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error solicitando OTP");
  return data as { ok: true; ttl?: number; to?: string };
}

export async function verifyOtp(to: string, code: string) {
  const res = await fetch(`${API_URL}/api/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "OTP inválido");
  return data as { ok: true };
}

export async function resendOtp(to: string) {
  return requestOtp(to);
}
