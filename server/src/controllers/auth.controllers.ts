import { FastifyRequest, FastifyReply } from "fastify";
import { generateTotpSecret, generateTotpCode, verifyTotpCode } from "../utils/totp";

// Tipado estricto para las peticiones entrantes
interface LoginBody {
    email?: string;
    password?: string;
}

interface VerifyBody {
    email?: string;
    code?: string;
}

// Simulación de base de datos temporal en memoria
const tempUserDb = new Map<string, string>(); 

export const login = async (
    request: FastifyRequest<{ Body: LoginBody }>, 
    reply: FastifyReply
) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return reply.status(400).send({ 
                status: 'error', 
                message: 'Email y contraseña requeridos' 
            });
        }

        // Fastify tiene resolución nativa de IP más segura
        const ip = request.ip || '127.0.0.1';
        const userAgent = request.headers['user-agent'] || 'Unknown';

        let riskScore = 0;
        const riskReasons: string[] = [];

        if(userAgent.includes("curl") || userAgent.includes("PostmanRuntime")) {
            riskScore += 40;
            riskReasons.push("Petición emitida desde una herramienta automatizada (Riesgo medio).");
        }

        if(!userAgent.includes("Mozilla") && !userAgent.includes("Expo")) {
            riskScore += 30;
            riskReasons.push("Dispositivo o navegador no reconocido por el sistema (Riesgo Bajo/Medio).");
        }

       // const threshold = Number(process.env.RISK_THRESHOLD) || 50;
       // const requiresMFA = riskScore >= threshold;

       // Y fuerza el MFA a true para desarrollo:
        const requiresMFA = true;

        let tempToken = null;
        let base32Secret = null;

        if(requiresMFA) {
            base32Secret = generateTotpSecret();
            tempToken = generateTotpCode({ secret: base32Secret });
            
            tempUserDb.set(email, base32Secret);

            console.log(`\n🔑 [MFA CHALLENGE] Usuario: ${email}`);
            console.log(`🔑 [MFA CHALLENGE] Secret Base32: ${base32Secret}`);
            console.log(`==> 🔴 CÓDIGO OTP (Vence en 30s): ${tempToken} 🔴 <==\n`);
        }

        return reply.send({
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
        // Fastify logger integrado
        request.log.error(error);
        return reply.status(500).send({ 
            status: 'error', 
            message: 'Error interno en el motor de riesgo', 
            debug_msg: error.message,
            debug_stack: error.stack
        });
    }
};

export const verifyMFA = async (
    request: FastifyRequest<{ Body: VerifyBody }>, 
    reply: FastifyReply
) => {
    try {
        const { email, code } = request.body;

        if (!email || !code) {
            return reply.status(400).send({ 
                status: 'error', 
                message: 'Faltan parámetros requeridos (email y code)' 
            });
        }

        const savedSecret = tempUserDb.get(email);
        
        if (!savedSecret) {
            return reply.status(404).send({ 
                status: 'error', 
                message: 'Usuario no encontrado o sesión inválida' 
            });
        }

        const isValid = verifyTotpCode(code, { 
            secret: savedSecret, 
            window: 1
        });

        // 🔥 LOGICA INVERTIDA CORREGIDA 🔥
        if (isValid) {
            tempUserDb.delete(email); 
            return reply.send({
                status: 'success',
                message: 'Autenticación MFA exitosa'
            });
        } else {
            return reply.status(401).send({ 
                status: 'error', 
                message: 'Código OTP inválido o expirado',
                valid: false
            });
        }
    } catch (error: any) {
        request.log.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.status(500).send({ 
            status: 'error', 
            message: 'Error interno en la verificación MFA', 
            debug_msg: errorMessage,
            debug_stack: error instanceof Error ? error.stack : undefined
        });
    }
};