# 🛠️ CourtManager — Manual de Operaciones, DevOps y Mantenimiento

> **Guía Oficial de Infraestructura, Despliegue Continuo, Respaldos y Recuperación ante Desastres.**  
> *Versión 2.0 Commercial Edition | Dirigido a Administradores de Sistemas, Ingenieros DevOps y Equipos de Soporte Nivel 3.*

---

## 1. Requisitos del Entorno y Pila Tecnológica

| Componente | Requisito Recomendado | Proveedor Recomendado |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js v20.x LTS o v22.x LTS con NPM v10+ | Render / Railway / Ubuntu 24.04 VPS |
| **Base de Datos Relacional** | PostgreSQL 16 con SSL y Connection Pooling | Neon Serverless Cloud |
| **Frontend Hosting** | Edge CDN con soporte SPA (Single Page App) | Netlify / Vercel / Cloudflare |
| **Mensajería Transaccional** | Servidor SMTP con autenticación TLS | Brevo (Sendinblue) / Resend |
| **Almacenamiento de Medios** | Volumen persistente o Bucket S3 | AWS S3 / Cloudflare R2 / Local Disk |

---

## 2. Matriz de Variables de Entorno (`.env.production`)

El sistema requiere las siguientes variables debidamente configuradas para producción:

```ini
# Configuración del Servidor
PORT=3000
NODE_ENV=production
TRUST_PROXY=true
TZ=America/Caracas

# Base de Datos (Neon PostgreSQL Serverless)
DATABASE_URL=postgres://usuario:contraseña@ep-dry-pond-12345.us-east-2.aws.neon.tech/neondb?sslmode=require

# Seguridad y Criptografía
JWT_SECRET=c1f4ad0b8f49e49a88e99b22a0149e4d588fbe6c46a6f3b0e45447b998cfbc90
JWT_EXPIRES_IN=7d

# Mensajería y Correo SMTP (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=notificaciones@courtmanager.app
SMTP_PASS=tu_clave_secreta_smtp_brevo
EMAIL_FROM="CourtManager Reservas <notificaciones@courtmanager.app>"

# Orígenes Permitidos (CORS)
CORS_ORIGINS=https://panel.courtmanager.app,https://reservas.courtmanager.app

# Límites de Tasa (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 3. Despliegue del Backend

### Opción A: Despliegue en Plataforma PaaS (Render / Railway)
1. Conecta el repositorio de GitHub al panel de control.
2. Selecciona **Root Directory:** `Backend`.
3. Configura:
   - **Build Command:** `npm install --omit=dev`
   - **Start Command:** `node server.js`
4. Agrega todas las variables de entorno detalladas en la sección 2.
5. Habilita el healthcheck apuntando a la ruta: `/api/health`.

### Opción B: Despliegue en Servidor Dedicado Linux (Ubuntu 24.04 LTS)

#### 1. Instalación de dependencias del sistema:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

#### 2. Configuración de PM2 (Process Manager):
```bash
cd /var/www/courtmanager/Backend
npm install --production
pm2 start server.js --name "courtmanager-api" -i max
pm2 save
pm2 startup
```

#### 3. Configuración de Reverse Proxy Nginx con soporte WebSockets:
Edita `/etc/nginx/sites-available/courtmanager.conf`:

```nginx
server {
    listen 80;
    server_name api.courtmanager.app;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Soporte para WebSockets
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Preservar cabeceras del cliente
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

#### 4. Emisión de Certificado SSL gratuito con Let's Encrypt:
```bash
sudo certbot --nginx -d api.courtmanager.app
```

---

## 4. Despliegue del Frontend (React + Vite)

### Configuración de Redirección SPA (`netlify.toml` / `_redirects`)
Dado que se trata de una aplicación React de una sola página, todas las rutas deben redirigir a `index.html`:

Crea el archivo `Frontend/public/_redirects`:
```
/*    /index.html   200
```

### Comando de Compilación:
```bash
cd Frontend
npm install
npm run build
```
La carpeta generada `dist/` se sube a Netlify, Vercel o la CDN correspondiente.

---

## 5. Estrategia de Respaldo y Restauración de Base de Datos

### 5.1. Respaldo Automático con Neon Cloud (Point-in-Time Recovery)
Neon realiza snapshots continuos de la base de datos sin impacto en el rendimiento. En caso de una eliminación accidental o corrupción de datos:
1. Accede a la consola de Neon.
2. Selecciona la rama `main` y haz clic en **Restore / Point-in-time**.
3. Selecciona la hora exacta a la que deseas rebobinar el estado del centro deportivo.

### 5.2. Backup Frío Manual (pg_dump)
Script automatizado para generar copias de seguridad locales o en la nube:

```bash
#!/bin/bash
FECHA=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/courtmanager"
mkdir -p $BACKUP_DIR

echo "Iniciando respaldo de base de datos..."
pg_dump "$DATABASE_URL" -F c -b -v -f "$BACKUP_DIR/db_backup_$FECHA.dump"

# Eliminar respaldos más antiguos a 30 días
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -exec rm {} \;
echo "Respaldo completado: db_backup_$FECHA.dump"
```

### 5.3. Restauración de un Respaldo:
```bash
pg_restore --clean --no-acl --no-owner -d "$DATABASE_URL" /var/backups/courtmanager/db_backup_20260928.dump
```

---

## 6. Monitoreo, Métricas y Solución de Problemas

### 6.1. Monitor de Salud (Healthcheck)
El endpoint `GET /api/health` devuelve:
```json
{
  "status": "OK",
  "timestamp": "2026-09-28T16:00:00.000Z",
  "service": "Canchas API",
  "environment": "production"
}
```
Configura una alerta en herramientas como **BetterStack**, **UptimeRobot** o **Pingdom** con comprobaciones cada 60 segundos.

### 6.2. Guía de Solución de Problemas (Troubleshooting)

| Síntoma | Diagnóstico | Acción Correctiva |
| :--- | :--- | :--- |
| **Error 502 Bad Gateway** | El proceso de Node.js se detuvo por error no capturado o reinicio. | Ejecuta `pm2 logs courtmanager-api` para revisar el stack trace. Verifica la conexión a Neon DB. |
| **WebSockets desconectados** | Nginx o el proxy cerró la conexión por falta de cabeceras de Upgrade. | Comprueba que la directiva `proxy_set_header Upgrade $http_upgrade;` esté presente en la configuración de Nginx. |
| **Error de CORS en navegador** | El dominio del frontend no está registrado en `CORS_ORIGINS`. | Añade la URL completa (con protocolo `https://`) en la variable `.env` y reinicia el servicio. |
| **Retraso en correos SMTP** | Bloqueo o cuota superada en Brevo. | Revisa las métricas en el panel de Brevo y confirma que el puerto 587 no esté bloqueado por el firewall de la red. |
