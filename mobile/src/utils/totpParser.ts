// mobile/src/utils/totpParser.ts

export type TotpAccount = {
  id: string;
  label: string;
  issuer?: string;
  secret: string;
  period: number;
  digits: number;
  algorithm: string;
};

export function normalizeBase32(raw: string): string {
  return (raw || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
}

export function parseOtpauthUri(uri: string): TotpAccount | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== "otpauth:" || url.hostname !== "totp") return null;

    // Quitar la barra inicial del pathname
    const path = decodeURIComponent(url.pathname.replace(/^\//, ""));
    let issuerFromPath: string | undefined;
    let label = path;
    
    if (path.includes(":")) {
      const [iss, lbl] = path.split(":");
      issuerFromPath = iss;
      label = lbl;
    }

    const secretRaw = url.searchParams.get("secret") || "";
    const secret = normalizeBase32(secretRaw);
    if (!secret) return null;

    return {
      // En el cliente usamos un fallback seguro para el ID mientras no haya crypto nativo
      id: Math.random().toString(36).substring(2, 15), 
      label,
      issuer: url.searchParams.get("issuer") || issuerFromPath || "Desconocido",
      secret,
      period: Number(url.searchParams.get("period") || 30),
      digits: Number(url.searchParams.get("digits") || 6),
      algorithm: url.searchParams.get("algorithm")?.toUpperCase() || "SHA1",
    };
  } catch (error) {
    console.error("Error parseando el QR en cliente:", error);
    return null;
  }
}