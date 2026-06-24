## Arquitectura del Proyecto (Reglas Estrictas)
1. **Límites del Monorepo:** Este directorio (`mobile/`) es EXCLUSIVAMENTE el frontend de React Native.
2. **PROHIBICIÓN DE IMPORTS:** Bajo ninguna circunstancia puedes sugerir importaciones de la carpeta `server/` o intentar usar módulos nativos de Node.js (como `crypto`, `fs`, `path`). 
3. **Comunicación:** Toda comunicación con el backend debe hacerse estrictamente a través de peticiones HTTP (`fetch`) usando la variable `API_URL`.

## Stack y Estilo de Código
* **Framework:** Expo SDK 56 con React Native.
* **Lenguaje:** TypeScript estricto. Prohibido usar `any`. Define siempre las interfaces de las props y de las respuestas HTTP.
* **Navegación:** Usa `@react-navigation/native-stack`. Tipa siempre las rutas en un archivo `types.ts`.
* **Componentes:** Usa siempre componentes funcionales y Hooks. Mantenlo modular y limpio.