# Sistema SaaS: Inicialización y Autenticación

Este documento define el plan arquitectónico para la fase inicial del SaaS, enfocándose exclusivamente en la configuración de la estructura base y la implementación del sistema de autenticación seguro, según los requerimientos.

## Instalación y Setup

Implementaremos la base aislada para Auth y Configuración Inicial.

### Fase 1: Inicialización
- **Estructura Base:** Creación de directorios `/frontend` y `/backend`.
- **Backend (NestJS):** Inicialización de la app Nest, configuración de Prisma y conexión inicial a MySQL.
- **Frontend (Next.js):** Generación del boilerplate App Router con Tailwind CSS + shadcn/ui.

### Fase 2: Autenticación (JWT + Refresh Tokens)
- **Capa Base de Datos (Prisma):** Modelos de `User` (email, password_hash, rol) y `RefreshToken` (token, id_usuario, expiración).
- **Capa Backend (NestJS):**
  - Módulo `Auth` y `Users`.
  - Rutas: `/auth/login`, `/auth/refresh`, `/auth/logout`.
  - Seguridad: Protección de rutas con Access Tokens (corta vida).
- **Capa Frontend (Next.js):**
  - Manejo de login utilizando Server Actions.
  - Almacenamiento seguro en Cookies HttpOnly.
  - Middleware para evitar acceso a rutas protegidas sin token válido.

## Plan de Verificación

### Pruebas Automatizadas
- Ejecutar pruebas generadas de NestJS post-inicialización para asegurar el correcto renderizado del bootstrap y los servicios `Auth`.

### Verificación Manual
- Levantar MySQL local y aplicar esquema de Prisma (`prisma db push` o `prisma migrate dev`).
- Probar un login manual usando la API, observando el seteo de las cookies o respuesta de tokens.
- Probar el intento de acceder a un área del frontend autenticada y verificar el bloqueo/redirección por protección del middleware.
