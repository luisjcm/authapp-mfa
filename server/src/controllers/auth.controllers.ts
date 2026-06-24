import { Request, Response } from "express";
import { generateTotpSecret, generateTotpCode, verifyTotpCode } from "../utils/totp.js";


const tempUserDb = new Map<string, string>(); // Simulación de base de datos temporal para almacenar códigos OTP generados


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
            let base32Secret = null;
            if(requiresMFA) {

                base32Secret = generateTotpSecret();
                tempToken = generateTotpCode({ secret: base32Secret });

                tempUserDb.set(email, base32Secret); // Guardamos el secreto en la "base de datos" temporal

                console.log(`\n🔑 [MFA CHALLENGE] Usuario: ${email}`);
                console.log(`🔑 [MFA CHALLENGE] Secret Base32: ${base32Secret}`);
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
};

export const verifyMFA = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            res.status(400).json({ 
                status: 'error', 
                message: 'Faltan parametros requeridos (email y code)' 
            });
            return;
        }

        const savedSecret = tempUserDb.get(email);
        if (!savedSecret) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Usuario no encontrado o sesión inválida' 
            });
        }

        const isValid = verifyTotpCode(code, { 
            secret: savedSecret, 
            window: 1
         });

         if (!isValid) {
        tempUserDb.delete(email); // Eliminamos el secreto de la "base de datos" temporal
        res.json({
                            status: 'success',
                            message: 'Autenticación MFA exitosa'
                        });
         } else {
            res.status(401).json({ 
                status: 'error', 
                message: 'Código OTP inválido o expirado',
                valid: false
            });
         }
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            res.status(500).json({ 
                status: 'error', 
                message: 'Error interno en la verificación MFA', 
                debug_msg: errorMessage,
                debug_stack: error instanceof Error ? error.stack : undefined
            });
        }
    }


     