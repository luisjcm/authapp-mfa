// src/utils/totp.ts
import CryptoJS from "crypto-js";
import { decode as base32decode } from "hi-base32";

// Estructura de cuenta guardada
export type TotpAccount = {
  id: string;              // uuid o timestamp
  label: string;           // p.ej. "GitHub"
  issuer?: string;         // p.ej. "GitHub"
  secret: string;          // BASE32 (sin espacios)
  period?: number;         // default 30
  digits?: number;         // default 6
  algorithm?: "SHA1" | "SHA256" | "SHA512"; // default SHA1
};

// =====================================================
// TOTP RFC6238 (HOTP + tiempo). Implementación en JS puro
// =====================================================

function base32ToBytes(b32: string): Uint8Array {
  // normalizamos: sin espacios y mayúsculas
  const clean = b32.replace(/\s+/g, "").toUpperCase();
  const bin = base32decode(clean); // devuelve string binario (bytes)
  // pasamos a Uint8Array
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function hmac(
  keyBytes: Uint8Array,
  msgBytes: Uint8Array,
  algo: "SHA1" | "SHA256" | "SHA512"
): Uint8Array {
  // CryptoJS trabaja con WordArray; creamos desde bytes
  const keyWA = CryptoJS.lib.WordArray.create(keyBytes as any);
  const msgWA = CryptoJS.lib.WordArray.create(msgBytes as any);

  let hash: CryptoJS.lib.WordArray;
  switch (algo) {
    case "SHA256":
      hash = CryptoJS.HmacSHA256(msgWA, keyWA);
      break;
    case "SHA512":
      hash = CryptoJS.HmacSHA512(msgWA, keyWA);
      break;
    default:
      hash = CryptoJS.HmacSHA1(msgWA, keyWA);
  }

  // WordArray → Uint8Array
  const hex = CryptoJS.enc.Hex.stringify(hash);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

function truncateToCode(hmacResult: Uint8Array, digits: number): string {
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binCode =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const mod = 10 ** digits;
  const code = (binCode % mod).toString().padStart(digits, "0");
  return code;
}

/** Genera TOTP para una cuenta dada */
export function genTotp(account: TotpAccount): string {
  const step = account.period ?? 30;
  const digits = account.digits ?? 6;
  const algo = account.algorithm ?? "SHA1";

  const counter = Math.floor(Date.now() / 1000 / step);

  // Counter → 8 bytes big-endian
  const msg = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    msg[i] = counter & 0xff;
    // TS exige >>> para mantener 32-bit unsigned
    // eslint-disable-next-line no-bitwise
    (counter as any) >>>= 8;
  }

  const key = base32ToBytes(account.secret);
  const mac = hmac(key, msg, algo);
  return truncateToCode(mac, digits);
}

/** Segundos que faltan para el siguiente tick del periodo */
export function remainingSeconds(period = 30) {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

// ---------------------------------------------
// Parser de otpauth://totp (mantén como lo tenías)
// ---------------------------------------------
export type ParsedOtpauth = TotpAccount & { type: "totp" };

// otpauth://totp/Issuer:Label?secret=ABCDEF&issuer=Issuer&period=30&digits=6&algorithm=SHA1
export function parseOtpauthUri(uri: string): ParsedOtpauth | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== "otpauth:" || url.hostname !== "totp") return null;

    const path = decodeURIComponent(url.pathname.replace(/^\//, "")); // "Issuer:Label" o "Label"
    let issuerFromPath: string | undefined;
    let label = path;
    if (path.includes(":")) {
      const [iss, lbl] = path.split(":");
      issuerFromPath = iss;
      label = lbl;
    }

    const secret = (url.searchParams.get("secret") || "").replace(/\s+/g, "");
    if (!secret) return null;

    const issuer = url.searchParams.get("issuer") || issuerFromPath;
    const period = Number(url.searchParams.get("period") || 30);
    const digits = Number(url.searchParams.get("digits") || 6);
    const algorithm = (url.searchParams.get("algorithm")?.toUpperCase() ||
      "SHA1") as ParsedOtpauth["algorithm"];

    return {
      id: String(Date.now()),
      type: "totp",
      label,
      issuer: issuer || undefined,
      secret,
      period,
      digits,
      algorithm,
    };
  } catch {
    return null;
  }
}
