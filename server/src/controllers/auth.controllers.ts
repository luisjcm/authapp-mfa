import { Request, Response } from "express";
import crypto from "crypto";

const generateTOTP = (secretHex: string): string => {
    // 1. Obtener el bloque de tiempo actual (ventanas exactas de 30 segundos)
    const counter = Math.floor(Date.now() / 30000);

    // 2. Guardar el contador en un Buffer de bytes (Formato Big-Endian de 64 bits)
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    // 3. Calcular el hash HMAC-SHA1 usando la semilla hex y el bloque de tiempo
    const hmac = crypto.createHmac("sha1", Buffer.from(secretHex, "hex")).update(buffer).digest();

    // 4. Truncamiento Dinámico (Extracción segura de 4 bytes basada en un offset)
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    // 5. Extraer los últimos 6 dígitos numéricos rellenando con ceros si es necesario
    return (binary % 1000000).toString().padStart(6, "0");
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const ip = (req.ip || req.headers['x-forwarded-for']|| '127.0.0.1') as string;
        const userAgent = (req.headers['user-agent'] || 'Unknown') as string;

        let riskScore = 0;
        const riskReasons: string[] = [];

        if(userAgent.includes("curl") || userAgent.includes("PostmanRuntime")) {
            riskScore += 40;
            riskReasons.push("Peticion emitida desde una herramienta de consola/API automatizada (Riesgo medio).");
        }

        if(!userAgent.includes("Mozilla") && !userAgent.includes("Expo")) {
            riskScore += 30;
            riskReasons.push("Dispositivo o navegador no reconocido por el sistema (Riesgo Bajo/Medio)");
            }

            const threshold = Number(process.env.RISK_THRESHOLD) || 50;
            const requiresMFA = riskScore >= threshold;


            let tempToken = null;
            if(requiresMFA) {
                const secret = crypto.randomBytes(20).toString("hex");
                tempToken = generateTOTP(secret);

                console.log(`\n🔑 [MFA CHALLENGE] Usuario: ${email}`);
                console.log(`🔑 [MFA CHALLENGE] Secret: ${secret}`);
                console.log(`==> 🔴 CÓDIGO OTP TEMPORAL (Vence en 30s): ${tempToken} 🔴 <==\n`);
                }

            res.json({
                status: 'success',
                decision: requiresMFA ? 'CHALLENGE_REQUIRED' : 'ALLOW_DIRECT',
                evaluation: {
                   risk_score: riskScore,
                   requires_mfa: requiresMFA,
                   reasons: riskReasons
                },
                captured_context: {
                    client_ip: ip,
                    device_user_agent: userAgent
                }
            });
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error interno en el motor de riesgo', 
            debug_msg: error.message,  // <-- Esto nos dirá qué falló
            debug_stack: error.stack   // <-- Esto nos dirá en qué línea exacta explotó
        });
    }
}