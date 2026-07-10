// mobile/src/api/auth.ts

// Asegúrate de usar la IP LAN de tu máquina donde corre Fastify, NO localhost ni 127.0.0.1
// porque el emulador/teléfono físico tiene su propio localhost.
const API_URL = 'http://192.168.100.221:3000/api'; //Desde casa
//const API_URL = 'http://192.168.59.55:3000/api'; //Desde la oficina

export const loginRequest = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/send-email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al conectar con el servidor');
  }

  return response.json();
};