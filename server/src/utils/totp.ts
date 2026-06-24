import crypto from "crypto";

export type TotpAlgorithm = "SHA1" | "SHA256" | "SHA512";

export type TotpAccount = {
    id: string;
    label: string;
    issuer?: string;
    secret: string; // Base32
    period?: number;
    digits?: number;
    algorithm?: TotpAlgorithm;
};

export type TotpOptions = {
    secret: string;
    period?: number;
    digits?: number;
    algorithm?: TotpAlgorithm;
    timestamp?: number;
};

// ===================== Helpers Base32 Nativos =====================
const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function normalizeBase32(raw: string): string {
    return (raw || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
}

export function base32ToBuffer(base32: string): Buffer {
    const normalized = normalizeBase32(base32);
    let bits = 0;
    let value = 0;
    let index = 0;
    const buffer = Buffer.alloc(Math.ceil((normalized.length * 5) / 8));

    for (let i = 0; i < normalized.length; i++) {
        const val = RFC4648_ALPHABET.indexOf(normalized[i]);
        if (val === -1) throw new Error("Invalid Base32 character");
        value = (value << 5) | val;
        bits += 5;
        if (bits >= 8) {
            buffer[index++] = (value >>> (bits - 8)) & 255;
            bits -= 8;
        }
    }
    return buffer.subarray(0, index);
}

export function bufferToBase32(buffer: Buffer): string {
    let bits = 0;
    let value = 0;
    let output = "";
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += RFC4648_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += RFC4648_ALPHABET[(value << (5 - bits)) & 31];
    }
    return output;
}

// ===================== Generación y Verificación =====================

export function generateTotpSecret(bytes = 20): string {
    const buffer = crypto.randomBytes(bytes);
    return bufferToBase32(buffer);
}

export function generateTotpCode({
    secret,
    period = 30,
    digits = 6,
    algorithm = "SHA1",
    timestamp = Date.now(),
}: TotpOptions): string {
    const key = base32ToBuffer(secret);
    const counter = Math.floor(timestamp / 1000 / period);
    
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    const hmac = crypto
        .createHmac(algorithm.toLowerCase(), key)
        .update(buffer)
        .digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    return (binary % 10 ** digits).toString().padStart(digits, "0");
}

export function verifyTotpCode(
    code: string,
    options: TotpOptions & { window?: number }
): boolean {
    const window = options.window ?? 1;
    const period = options.period ?? 30;
    const timestamp = options.timestamp ?? Date.now();

    for (let i = -window; i <= window; i++) {
        const candidateTimestamp = timestamp + i * period * 1000;
        const candidateCode = generateTotpCode({
            ...options,
            timestamp: candidateTimestamp,
        });

        if (crypto.timingSafeEqual(Buffer.from(candidateCode), Buffer.from(code))) {
            return true;
        }
    }
    return false;
}

// ===================== Parser URI (Tesis Histórica) =====================

export function parseOtpauthUri(uri: string): TotpAccount | null {
    try {
        const url = new URL(uri);
        if (url.protocol !== "otpauth:" || url.hostname !== "totp") return null;

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
            id: crypto.randomUUID(), // Actualizado a UUID nativo
            label,
            issuer: url.searchParams.get("issuer") || issuerFromPath || undefined,
            secret,
            period: Number(url.searchParams.get("period") || 30),
            digits: Number(url.searchParams.get("digits") || 6),
            algorithm: (url.searchParams.get("algorithm")?.toUpperCase() || "SHA1") as TotpAlgorithm,
        };
    } catch {
        return null;
    }
}