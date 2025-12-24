# Shortcut AI Changelog Generator

Esta es una aplicación web para generar automáticamente changelogs de historias de Shortcut utilizando la IA de Gemini.

## Configuración y Desarrollo Local

**Requisitos:** Node.js (v18+)

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
    GEMINI_API_KEY=tu_gemini_api_key
    SHORTCUT_TOKEN=tu_shortcut_token
    ```

3.  **Ejecutar la aplicación:**
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en `http://localhost:3000`.

## ¿Cómo funciona el CORS?
La aplicación está configurada con un proxy en Vite (`vite.config.ts`) que redirige las peticiones a la API de Shortcut. Esto permite que la herramienta funcione perfectamente en tu navegador local sin problemas de seguridad o bloqueos de macOS.

---
*Nota: Para que tus compañeros la usen, solo tienen que clonar el repo y ejecutar `npm install` y `npm run dev`.*
