import Fastify from 'fastify';
import { authRoutes } from './routes/auth.routes.js';

// Inicializamos Fastify con Pino Logger para desarrollo
const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Endpoint de Health Check (Útil para verificar conexión desde el móvil)
server.get('/api/health', async (request, reply) => {
  return { 
    status: 'success', 
    message: 'AuthApp MFA Server is running', 
    uptime: process.uptime() 
  };
});

// TODO: Aquí registraremos las nuevas rutas de autenticación en el siguiente paso
server.register(authRoutes, { prefix: '/api' });

// Inicialización del servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    // host '0.0.0.0' es vital para recibir peticiones de la app móvil en tu LAN
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();