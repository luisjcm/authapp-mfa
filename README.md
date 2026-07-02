# Backend de Autenticación Adaptativa (MFA Engine)

Este servicio implementa una arquitectura de autenticación de **"Seguridad Basada en el Comportamiento"** para la bóveda de seguridad *Mi Caja Fuerte*. El objetivo es reducir la fricción del usuario mediante una evaluación de riesgos en tiempo real antes de requerir un segundo factor (TOTP).


## 🧠 Arquitectura de Seguridad

El flujo de autenticación opera bajo un motor de riesgo adaptativo:

### 1. Evaluación de Contexto
Al recibir una petición, el servidor captura metadatos críticos:
- **IP Address**: Identificación de origen.
- **User-Agent**: Detección de dispositivos (Browser vs. Expo vs. CLI/Postman).

### 2. Motor de Riesgo
Se asigna una puntuación (`risk_score`) basada en heurísticas:
- `+40 pts` si el origen es una herramienta automatizada (curl, Postman).
- `+30 pts` si el dispositivo no es reconocido (no coincide con Mozilla/Expo).

### 3. Decisión Adaptativa
- **`ALLOW_DIRECT` (Score < 50):** El usuario accede sin fricción.
- **`CHALLENGE_REQUIRED` (Score >= 50):** El sistema detiene el proceso y solicita un código TOTP generado dinámicamente.

---

## 🛡️ Implementación Criptográfica
- **TOTP:** Implementación nativa siguiendo el estándar **RFC 6238**.
- **Seguridad:** Uso de `crypto.timingSafeEqual` para prevenir ataques de temporización.
- **Escalabilidad:** Implementado con **Fastify**, optimizado para baja latencia (response times < 10ms).

## 🚀 Endpoints Principales

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/send-email/verify` | `POST` | Evalúa el riesgo y decide si se requiere MFA. |
| `/api/verify-otp` | `POST` | Valida el código TOTP de 6 dígitos. |