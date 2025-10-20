# AuthApp MFA

## Portfolio / Demo builds

Para generar un bundle web que abra directamente el menú principal (sin login ni onboarding), exporta la variable de entorno antes de construir:

```bash
export EXPO_PUBLIC_FORCE_HOME=true
expo export:web
```

El flag `EXPO_PUBLIC_FORCE_HOME` crea una sesión ficticia en el navegador y marca el onboarding como completado para que el inicio en Netlify muestre el dashboard raíz.
