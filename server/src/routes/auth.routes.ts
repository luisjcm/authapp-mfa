import { FastifyInstance } from 'fastify';
import { login, verifyMFA } from '../controllers/auth.controllers';

export async function authRoutes(server: FastifyInstance) {
  
  // Conectamos el endpoint directamente al controlador real
  server.post('/send-email/verify', login);

  // Conectamos el endpoint de verificación al controlador real
  server.post('/verify-otp', verifyMFA);

}