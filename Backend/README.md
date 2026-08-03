# Gestor de Canchas Deportivas

Backend en Node.js + Express + PostgreSQL para la administración de canchas, reservas, clientes, productos, facturación y auditoría.

## Estructura del proyecto

- `src/config` - Configuración de la base de datos
- `src/controllers` - Lógica de entrada/negocio por recurso
- `src/middleware` - Autenticación, errores y utilidades comunes
- `src/models` - Acceso a datos para cada tabla
- `src/routes` - Definición de endpoints
- `src/services` - Lógica compartida y reglas de negocio
- `src/utils` - Utilidades generales
- `uploads` - Almacenamiento de archivos subidos

## Requisitos

- Node.js 18+ recomendado
- PostgreSQL / Neon con la variable `DATABASE_URL`

## Variables de entorno

Crea un archivo `.env` con estas variables:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/base?sslmode=require
JWT_SECRET=tu_secreto_jwt_seguro
```

También existe un ejemplo en `.env.example`.

## Instalación

```bash
npm install
```

## Ejecución

- Desarrollo:

```bash
npm run dev
```

- Producción:

```bash
npm start
```

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/courts`
- `GET /api/bookings`
- `GET /api/billings`
- `GET /api/products`

> Todas las rutas protegidas requieren el header `Authorization: Bearer <token>`.

## Detalles técnicos

- Autenticación JWT con `jsonwebtoken`
- Contraseñas encriptadas con `bcryptjs`
- Validación de entradas con `express-validator`
- Manejo de errores centralizado
- Conexión a PostgreSQL reutilizando `src/config/db.js`

## Subida a GitHub

1. Inicializa el repositorio local (ya realizado en este proyecto):

```bash
git init
```

2. Agrega los archivos y haz commit:

```bash
git add .
git commit -m "Init backend gestor de canchas"
```

3. Agrega el remote de GitHub y sube la rama principal:

```bash
git remote add origin https://github.com/AndersonC-Engineer/aplication-backend.git
git branch -M main
git push -u origin main
```

