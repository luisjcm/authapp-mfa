import { Request, Response } from "express";

export const login = (req: Request, res: Response) => {
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

            const requiresMFA = riskScore >= 50;

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
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
}