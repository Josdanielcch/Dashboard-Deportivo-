const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getBrowserPath() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// Estilos globales compartidos para todos los documentos PDF
const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: A4;
    margin: 14mm 14mm 14mm 14mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.55;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
  }

  .header-card {
    background: linear-gradient(135deg, #060a1a 0%, #0f1738 100%);
    border-radius: 14px;
    padding: 24px 28px;
    color: #ffffff;
    margin-bottom: 22px;
    position: relative;
    border: 1px solid #1e293b;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(204, 255, 0, 0.12);
    border: 1px solid rgba(204, 255, 0, 0.35);
    color: #ccff00;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .header-title {
    font-size: 22pt;
    font-weight: 800;
    margin: 0 0 6px 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title span.accent {
    color: #ccff00;
  }

  .header-subtitle {
    font-size: 11pt;
    color: #94a3b8;
    margin: 0 0 14px 0;
    font-weight: 500;
    line-height: 1.4;
  }

  .header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 8.5pt;
    color: #cbd5e1;
  }

  .header-meta strong {
    color: #ffffff;
  }

  h2 {
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    margin: 22px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
    page-break-after: avoid;
  }

  h2 .num {
    background: #0f1738;
    color: #ccff00;
    font-size: 8.5pt;
    padding: 2px 7px;
    border-radius: 5px;
    font-weight: 800;
  }

  h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #1e293b;
    margin: 14px 0 6px 0;
    page-break-after: avoid;
  }

  h4 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #334155;
    margin: 10px 0 4px 0;
  }

  p {
    margin: 0 0 10px 0;
    color: #334155;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 12px 0 16px 0;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    overflow: hidden;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  th {
    background: #0f1738;
    color: #ffffff;
    padding: 9px 12px;
    font-weight: 700;
    text-align: left;
    font-size: 8.5pt;
    letter-spacing: 0.03em;
  }

  td {
    padding: 9px 12px;
    border-top: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 12px 0 16px 0;
    page-break-inside: avoid;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin: 12px 0 16px 0;
    page-break-inside: avoid;
  }

  .feature-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    padding: 12px 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .feature-card.highlight {
    border-color: #0f1738;
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
  }

  .feature-title {
    font-weight: 700;
    font-size: 10pt;
    color: #0f172a;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .feature-desc {
    font-size: 8.5pt;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }

  .step-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0f1738;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  .step-box.active {
    border-left-color: #ccff00;
    background: #fafcfe;
  }

  .step-header {
    font-weight: 800;
    font-size: 10.5pt;
    color: #0f172a;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pill {
    display: inline-block;
    font-size: 7.5pt;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    text-transform: uppercase;
  }

  .pill-green {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  .pill-blue {
    background: #e0e7ff;
    color: #3730a3;
    border: 1px solid #c7d2fe;
  }

  .pill-volt {
    background: #060a1a;
    color: #ccff00;
    border: 1px solid #1e293b;
  }

  .pill-purple {
    background: #f3e8ff;
    color: #7e22ce;
    border: 1px solid #e9d5ff;
  }

  pre, code {
    font-family: 'JetBrains Mono', monospace;
  }

  pre {
    background: #0b112c;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 8pt;
    overflow-x: auto;
    border: 1px solid #1e293b;
    margin: 8px 0 12px 0;
    line-height: 1.4;
    page-break-inside: avoid;
  }

  code:not(pre code) {
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 8.5pt;
    border: 1px solid #e2e8f0;
  }

  ul, ol {
    margin: 6px 0 10px 0;
    padding-left: 20px;
    color: #334155;
  }

  li {
    margin-bottom: 4px;
    font-size: 9.5pt;
  }

  .doc-footer {
    margin-top: 26px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: #64748b;
    page-break-before: avoid;
  }

  .page-break {
    page-break-before: always;
  }

  .callout {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 10px 14px;
    border-radius: 6px;
    margin: 10px 0;
    font-size: 9pt;
    color: #1e3a8a;
  }
`;

// Generador Documento 2: Manual de Implementación y Onboarding
function buildHtmlDoc2() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CourtManager — Manual de Implementación y Onboarding</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="header-card">
    <div class="header-badge">★ Customer Success & Guía Operativa • Edición Comercial v2.0</div>
    <div class="header-title">Court<span class="accent">Manager</span> — Onboarding</div>
    <div class="header-subtitle">Manual de Implementación y Puesta en Marcha en 15 Minutos para Centros Deportivos.</div>
    <div class="header-meta">
      <div><strong>Dirigido a:</strong> Administradores, Gerentes y Cajeros</div>
      <div><strong>Tiempo Estimado:</strong> 15 Minutos</div>
      <div><strong>Alcance:</strong> Canchas, POS, Personal & Web</div>
      <div><strong>Emisión:</strong> Septiembre 2026</div>
    </div>
  </div>

  <h2><span class="num">01</span> Introducción y Requisitos Previos</h2>
  <p>
    Esta guía permite a cualquier centro deportivo (*pádel, fútbol 5/7, tenis o polideportivo*) configurar y poner en marcha CourtManager en <strong>menos de 15 minutos</strong>, logrando un control operativo total desde el primer turno.
  </p>

  <div class="grid-2">
    <div class="feature-card highlight">
      <div class="feature-title">📋 Lista de Verificación Inicial</div>
      <ul style="margin: 4px 0 0 0; padding-left: 16px;">
        <li>Datos fiscales, RIF/NIT y logo de la empresa.</li>
        <li>Cuentas receptoras de pago (Pago Móvil, Zelle, Transferencias).</li>
        <li>Nombres de canchas, duración y tarifas por hora.</li>
      </ul>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">⚡ Objetivos del Onboarding</div>
      <ul style="margin: 4px 0 0 0; padding-left: 16px;">
        <li>Publicar el portal web para reservas de jugadores 24/7.</li>
        <li>Habilitar el POS de mostrador con margen de ganancia.</li>
        <li>Crear usuarios con permisos aislados para recepcionistas.</li>
      </ul>
    </div>
  </div>

  <h2><span class="num">02</span> Proceso de Configuración en 6 Pasos</h2>

  <div class="step-box active">
    <div class="step-header">
      <span>Paso 1: Configuración de la Empresa y Moneda Base</span>
      <span class="pill pill-blue">2 Minutos</span>
    </div>
    <p>Ingresa a <code>⚙️ Configuración / Ajustes</code> con tu usuario SuperAdmin:</p>
    <ul>
      <li><strong>Razón Social y Teléfono:</strong> Visibles en los recibos y portal web.</li>
      <li><strong>Moneda Base:</strong> Dólar Estadounidense (<code>USD</code>) para proteger las finanzas de la inflación.</li>
      <li><strong>Tasa de Cambio del Día:</strong> Introduce la tasa oficial de referencia (BCV). Esta tasa se sincronizará automáticamente con todas las pantallas y el checkout en línea.</li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span>Paso 2: Registro de Cuentas Bancarias de Cobro</span>
      <span class="pill pill-blue">3 Minutos</span>
    </div>
    <p>Dirígete a <code>💳 Finanzas ➔ Cuentas de Pago</code> y agrega tus canales de recaudación:</p>
    <ul>
      <li><strong>Pago Móvil & Transferencias (VES):</strong> Banco, teléfono, RIF/Cédula y número de cuenta.</li>
      <li><strong>Zelle / Internacional (USD):</strong> Correo o titular.</li>
      <li><strong>Caja en Efectivo:</strong> Habilitada para pagos en mostrador en dólares o bolívares.</li>
      <li>Marca <em>"Visible en Portal Público"</em> para que los clientes vean las cuentas bancarias al reservar por la web.</li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span>Paso 3: Alta de Deportes y Canchas</span>
      <span class="pill pill-blue">3 Minutos</span>
    </div>
    <p>En <code>🎾 Deportes y Canchas</code>, crea cada cancha del club:</p>
    <ul>
      <li><strong>Nombre:</strong> Ej. <em>"Cancha 1 — Cristal Panorámica"</em> o <em>"Cancha 2 — Fútbol 5 Techado"</em>.</li>
      <li><strong>Tarifa por Hora:</strong> Precio estándar en USD (ej. <code>$25.00/h</code>).</li>
      <li><strong>Iluminación & Superficie:</strong> Indica si tiene reflectores nocturnos y tipo de suelo.</li>
      <li><strong>Foto:</strong> Sube una imagen de buena calidad para el catálogo web de clientes.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <div class="step-box">
    <div class="step-header">
      <span>Paso 4: Carga de Inventario Inicial y Margen en POS</span>
      <span class="pill pill-blue">3 Minutos</span>
    </div>
    <p>En <code>🛍️ Inventario / POS ➔ Productos</code>, da de alta los consumibles de cantina:</p>
    <ul>
      <li><strong>Producto:</strong> Agua Mineral 500ml, Gatorade, Pelotas Head Pro, etc.</li>
      <li><strong>Costo de Compra:</strong> Lo que te cobra el proveedor (ej. <code>$0.80</code>).</li>
      <li><strong>Precio de Venta:</strong> Lo que paga el jugador (ej. <code>$2.00</code>).</li>
      <li><strong>Cálculo Automático:</strong> El sistema calcula la <strong>Ganancia Neta ($1.20)</strong> y el <strong>Margen (60%)</strong> en tiempo real.</li>
      <li><strong>Alerta de Stock Mínimo:</strong> Se activa la campana si el inventario desciende del umbral de seguridad.</li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span>Paso 5: Creación de Personal y Permisos de Acceso</span>
      <span class="pill pill-blue">2 Minutos</span>
    </div>
    <p>En <code>👥 Usuarios y Permisos</code>, genera una cuenta individual para cada recepcionista:</p>
    <ul>
      <li><strong>Rol Administrador:</strong> Acceso total a reportes financieros, utilidades netas y auditoría.</li>
      <li><strong>Rol Operador / Recepción:</strong> Acceso enfocado a registrar reservas, cobrar en caja y despachar en POS. Protege la información financiera sensible de la empresa.</li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span>Paso 6: Lanzamiento y Prueba del Portal de Clientes</span>
      <span class="pill pill-blue">2 Minutos</span>
    </div>
    <p>Abre el enlace de tu portal web (ej. <code>reservas.tuclub.com</code>) en un teléfono móvil:</p>
    <ul>
      <li>Selecciona una cancha, escoge horario libre y adjunta un comprobante de prueba.</li>
      <li>Verifica que la campana en el panel de recepción emita la notificación sonora.</li>
      <li>El turno quedará bloqueado de inmediato en el cuadrante para prevenir solapamientos.</li>
    </ul>
  </div>

  <h2><span class="num">03</span> Rutina Diaria del Operador de Recepción</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Momento del Día</th>
        <th style="width: 45%;">Acción Operativa</th>
        <th style="width: 30%;">Impacto en el Sistema</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>🌅 Apertura (08:00 AM)</strong></td>
        <td>Abrir turno de caja e ingresar fondo inicial en USD y Bs. Verificar tasa BCV en header.</td>
        <td><span class="pill pill-green">Caja Activa & Calibrada</span></td>
      </tr>
      <tr>
        <td><strong>🎾 Operación Continua</strong></td>
        <td>Validar comprobantes web, cobrar turnos de mostrador y registrar ventas de tienda en POS.</td>
        <td><span class="pill pill-blue">Stock & Cuadrante en Vivo</span></td>
      </tr>
      <tr>
        <td><strong>🌙 Cierre (11:00 PM)</strong></td>
        <td>Realizar arqueo de caja, conteo de efectivo y emitir reporte de cuadre de turno.</td>
        <td><span class="pill pill-volt">Auditoría Cerrada</span></td>
      </tr>
    </tbody>
  </table>

  <h2><span class="num">04</span> Matriz de Soporte Rápido para Recepcionistas</h2>
  <table>
    <thead>
      <tr>
        <th>Incidencia</th>
        <th>Causa</th>
        <th>Solución Inmediata</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Turno bloqueado sin pago</strong></td>
        <td>El cliente no completó la reserva web.</td>
        <td>Clic derecho en el cuadrante ➔ <em>Liberar Turno</em>.</td>
      </tr>
      <tr>
        <td><strong>La campana no suena</strong></td>
        <td>Audio bloqueado por el navegador.</td>
        <td>Hacer clic en el candado de la URL y cambiar Sonido a <em>Permitir</em>.</td>
      </tr>
      <tr>
        <td><strong>Monto en Bs. desactualizado</strong></td>
        <td>Variación de la tasa oficial del BCV.</td>
        <td>Tocar la píldora de tasa en el header y actualizar el valor.</td>
      </tr>
    </tbody>
  </table>

  <div class="doc-footer">
    <div><strong>CourtManager Tech Solutions</strong> • Customer Success Guide</div>
    <div>Documento de Operaciones Confidencial © 2026. Todos los derechos reservados.</div>
  </div>
</body>
</html>`;
}

// Generador Documento 3: Whitepaper de Arquitectura y Seguridad
function buildHtmlDoc3() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CourtManager — Arquitectura, Seguridad e Infraestructura Cloud</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="header-card">
    <div class="header-badge">★ Whitepaper Técnico • Seguridad & Alta Disponibilidad v2.0</div>
    <div class="header-title">Court<span class="accent">Manager</span> — Arquitectura Cloud</div>
    <div class="header-subtitle">Especificación Técnica de Topología de Red, Seguridad de Datos y Tiempo Real.</div>
    <div class="header-meta">
      <div><strong>Audiencia:</strong> CTOs, Ingenieros de Software & Auditores</div>
      <div><strong>Infraestructura:</strong> Cloud Native Serverless</div>
      <div><strong>Protocolo:</strong> WebSockets Bidireccionales (&lt;50ms)</div>
      <div><strong>Emisión:</strong> Septiembre 2026</div>
    </div>
  </div>

  <h2><span class="num">01</span> Topología de Red y Arquitectura de Tres Capas</h2>
  <p>
    CourtManager está construido sobre una arquitectura desacoplada orientada a eventos, diseñada para soportar alta concurrencia de reservas simultáneas con latencias de respuesta imperceptibles:
  </p>

  <div class="grid-3">
    <div class="feature-card highlight">
      <div class="feature-title">🌐 1. Presentación (SPA)</div>
      <p class="feature-desc">React 19 con Vite, Tailwind CSS y componentes Shadcn UI. Servido a través de CDN global en el Edge con compresión Brotli y First Contentful Paint &lt; 0.8s.</p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">⚡ 2. API & WebSockets</div>
      <p class="feature-desc">Node.js LTS con Express y Socket.IO. Servidor no bloqueante para gestionar cientos de conexiones concurrentes y salas aisladas para cada complejo deportivo.</p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">☁️ 3. Persistencia Cloud</div>
      <p class="feature-desc">PostgreSQL 16 Serverless en Neon Cloud. Separación de cómputo y almacenamiento con escalado instantáneo, cifrado SSL forzado y backups PITR continuos.</p>
    </div>
  </div>

  <h2><span class="num">02</span> Algoritmo Transaccional Anti-Overbooking</h2>
  <p>
    Para evitar que dos usuarios reserven el mismo turno al mismo milisegundo, la API implementa bloqueos a nivel de fila mediante transacciones ACID en PostgreSQL:
  </p>
  <pre>BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Bloqueo pesimista de filas en conflicto
SELECT id FROM bookings
WHERE court_id = $court_id 
  AND booking_date = $booking_date 
  AND status NOT IN ('cancelled', 'rejected')
  AND (start_time &lt; $end_time AND end_time &gt; $start_time)
FOR UPDATE;

-- Si existe solapamiento -> ROLLBACK y HTTP 409 Conflict
-- Si está libre -> INSERT INTO bookings (...) VALUES (...);
COMMIT;

-- Emisión inmediata del evento WebSocket a todos los paneles
io.to('dashboard').emit('booking:created', { bookingId, courtId });</pre>

  <h2><span class="num">03</span> Matriz de Seguridad y Protección de Datos</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Vector de Seguridad</th>
        <th style="width: 40%;">Mecanismo de Protección</th>
        <th style="width: 30%;">Estándar / Nivel</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Criptografía de Contraseñas</strong></td>
        <td>Hashing unidireccional adaptativo con salt rounds.</td>
        <td><span class="pill pill-green">bcrypt (10 Rondas)</span></td>
      </tr>
      <tr>
        <td><strong>Autenticación de API</strong></td>
        <td>Tokens criptográficos firmados sin estado en cabeceras.</td>
        <td><span class="pill pill-blue">JWT (HMAC-SHA256)</span></td>
      </tr>
      <tr>
        <td><strong>Mitigación DDoS & Brute Force</strong></td>
        <td>Limitador de peticiones por ventana de tiempo por IP.</td>
        <td><span class="pill pill-purple">express-rate-limit</span></td>
      </tr>
      <tr>
        <td><strong>Aislamiento de Recursos</strong></td>
        <td>Lista blanca estricta de dominios autorizados y credenciales.</td>
        <td><span class="pill pill-blue">Strict CORS Whitelist</span></td>
      </tr>
      <tr>
        <td><strong>Inyección SQL & XSS</strong></td>
        <td>Consultas parametrizadas obligatorias y cabeceras seguras.</td>
        <td><span class="pill pill-green">Helmet + Prepared Stmts</span></td>
      </tr>
      <tr>
        <td><strong>Auditoría Inmutable</strong></td>
        <td>Bitácora de auditoría de solo inserción con IP, usuario y hora.</td>
        <td><span class="pill pill-volt">Append-Only Audit</span></td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2><span class="num">04</span> Políticas de Continuidad del Negocio y SLAs</h2>
  <div class="grid-2">
    <div class="feature-card">
      <div class="feature-title">🛡️ Respaldo Continuo (RPO &lt; 5 min)</div>
      <p class="feature-desc">Neon Cloud realiza snapshots automáticos de cada transacción mediante WAL (Write-Ahead Logging), permitiendo rebobinar la base de datos a cualquier segundo de los últimos 30 días.</p>
    </div>
    <div class="feature-card">
      <div class="feature-title">⚡ Disponibilidad Garantizada (99.9% SLA)</div>
      <p class="feature-desc">Arquitectura multizona sin punto único de fallo. Si un nodo de cómputo se reinicia, el balanceador redirige el tráfico en menos de 3 segundos sin pérdida de información.</p>
    </div>
  </div>

  <h2><span class="num">05</span> Cumplimiento y Privacidad de la Información</h2>
  <p>
    CourtManager cumple con los principios de privacidad desde el diseño:
  </p>
  <ul>
    <li><strong>Cifrado Integral:</strong> TLS 1.3 con certificados RSA de 2048 bits para todo el tráfico web y cifrado AES-256 en reposo en la base de datos cloud.</li>
    <li><strong>Segmentación de Datos:</strong> Cada complejo deportivo opera de forma aislada, evitando cualquier cruce de clientes, facturas o métricas financieras entre negocios.</li>
    <li><strong>Sin Almacenamiento de Tarjetas:</strong> CourtManager no almacena números de tarjeta de crédito ni claves bancarias, delegando la captura a pasarelas certificadas y comprobantes bancarios directos.</li>
  </ul>

  <div class="doc-footer">
    <div><strong>CourtManager Tech Solutions</strong> • Cloud Architecture Whitepaper</div>
    <div>Documento Técnico Confidencial © 2026. Todos los derechos reservados.</div>
  </div>
</body>
</html>`;
}

// Generador Documento 4: API Reference e Integración
function buildHtmlDoc4() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CourtManager — Referencia de la API REST & WebSockets</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="header-card">
    <div class="header-badge">★ Developer Docs • RESTful API & Sockets v2.0</div>
    <div class="header-title">Court<span class="accent">Manager</span> — API Reference</div>
    <div class="header-subtitle">Especificación Técnica para Integraciones, Bots de WhatsApp, Apps Móviles y ERPs.</div>
    <div class="header-meta">
      <div><strong>Formato:</strong> JSON RESTful</div>
      <div><strong>Autenticación:</strong> Bearer JWT Token</div>
      <div><strong>Tiempo Real:</strong> Socket.IO Engine</div>
      <div><strong>Emisión:</strong> Septiembre 2026</div>
    </div>
  </div>

  <h2><span class="num">01</span> Estructura Estándar de Respuesta</h2>
  <p>Todas las respuestas de la API están empaquetadas en un envoltorio consistente:</p>
  <div class="grid-2">
    <div>
      <h4>✅ Respuesta Exitosa (HTTP 200 / 201)</h4>
      <pre>{
  "success": true,
  "data": {
    "id": 104,
    "status": "confirmed"
  }
}</pre>
    </div>
    <div>
      <h4>❌ Respuesta de Error (HTTP 4xx / 5xx)</h4>
      <pre>{
  "success": false,
  "error": "El turno seleccionado ya fue reservado.",
  "code": "SLOT_CONFLICT"
}</pre>
    </div>
  </div>

  <h2><span class="num">02</span> Endpoints Principales</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Método</th>
        <th style="width: 35%;">Ruta</th>
        <th style="width: 30%;">Descripción</th>
        <th style="width: 20%;">Acceso</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="pill pill-green">POST</span></td>
        <td><code>/api/auth/login</code></td>
        <td>Inicia sesión y genera token JWT.</td>
        <td>Público</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">GET</span></td>
        <td><code>/api/courts</code></td>
        <td>Catálogo de canchas con tarifas y deporte.</td>
        <td>Público</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">GET</span></td>
        <td><code>/api/bookings</code></td>
        <td>Consulta turnos por fecha o cancha.</td>
        <td>Bearer Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">POST</span></td>
        <td><code>/api/bookings</code></td>
        <td>Crea reserva con bloqueo atómico.</td>
        <td>Público / Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-purple">PATCH</span></td>
        <td><code>/api/bookings/:id/status</code></td>
        <td>Confirma, anula o completa una reserva.</td>
        <td>Operador / Admin</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">GET</span></td>
        <td><code>/api/products</code></td>
        <td>Inventario con stock, costo y margen %.</td>
        <td>Operador / Admin</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">POST</span></td>
        <td><code>/api/billings</code></td>
        <td>Venta en POS y descuento de inventario.</td>
        <td>Operador / Admin</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">GET</span></td>
        <td><code>/api/exchange-rates/latest</code></td>
        <td>Obtiene la tasa activa de conversión.</td>
        <td>Público</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">POST</span></td>
        <td><code>/api/exchange-rates</code></td>
        <td>Actualiza la tasa oficial del día.</td>
        <td>Solo Admin</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">GET</span></td>
        <td><code>/api/reports/pnl</code></td>
        <td>Reporte de ingresos, utilidad y margen %.</td>
        <td>Solo Admin</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2><span class="num">03</span> Eventos WebSockets en Tiempo Real (Socket.IO)</h2>
  <p>Conéctate al servidor de sockets para recibir actualizaciones sin recargar la página:</p>
  <pre>import { io } from 'socket.io-client';

const socket = io('https://api.courtmanager.app', {
  transports: ['websocket'],
  withCredentials: true
});

socket.emit('join-dashboard');

socket.on('booking:created', (data) => {
  console.log('Nueva reserva en cancha:', data.court_id);
  // Bloquear celda en el cuadrante visual
});

socket.on('exchange_rate:updated', (data) => {
  console.log('Nueva tasa referencial:', data.rate);
  // Actualizar píldora de cabecera
});</pre>

  <h2><span class="num">04</span> Ejemplo de Integración Externa (Bot o App)</h2>
  <p>Ejemplo en JavaScript para consultar turnos disponibles y crear reservas de forma automatizada:</p>
  <pre>const res = await fetch('https://api.courtmanager.app/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    court_id: 2,
    booking_date: '2026-09-28',
    start_time: '19:00:00',
    end_time: '20:30:00',
    customer_name: 'Marcos Soto',
    customer_phone: '+584149876543',
    payment_method: 'pago_movil',
    payment_reference: 'REF-773821'
  })
});

const data = await res.json();
console.log(data.data.booking_id);</pre>

  <div class="doc-footer">
    <div><strong>CourtManager Tech Solutions</strong> • API Reference Documentation</div>
    <div>Documento Técnico Confidencial © 2026. Todos los derechos reservados.</div>
  </div>
</body>
</html>`;
}

// Generador Documento 5: Manual de DevOps y Operaciones
function buildHtmlDoc5() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CourtManager — Manual de DevOps, Mantenimiento y SLAs</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="header-card">
    <div class="header-badge">★ Infraestructura & Mantenimiento • Guía DevOps v2.0</div>
    <div class="header-title">Court<span class="accent">Manager</span> — DevOps & SLAs</div>
    <div class="header-subtitle">Guía Oficial de Despliegue en Producción, Respaldos y Recuperación ante Desastres.</div>
    <div class="header-meta">
      <div><strong>Audiencia:</strong> SysAdmins, DevOps & Soporte L3</div>
      <div><strong>Entorno:</strong> Linux Ubuntu 24.04 / Cloud PaaS</div>
      <div><strong>RPO / RTO:</strong> &lt; 5 min / &lt; 30 min</div>
      <div><strong>Emisión:</strong> Septiembre 2026</div>
    </div>
  </div>

  <h2><span class="num">01</span> Variables de Entorno de Producción (<code>.env</code>)</h2>
  <pre>PORT=3000
NODE_ENV=production
TRUST_PROXY=true
TZ=America/Caracas

# Base de Datos Neon Cloud
DATABASE_URL=postgres://user:pass@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Criptografía
JWT_SECRET=super_secret_jwt_key_prod_64_chars_min
JWT_EXPIRES_IN=7d

# Mensajería SMTP Brevo
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=notificaciones@courtmanager.app
SMTP_PASS=tu_clave_smtp_brevo

# CORS Autorizados
CORS_ORIGINS=https://panel.courtmanager.app,https://reservas.courtmanager.app</pre>

  <h2><span class="num">02</span> Procedimiento de Despliegue en Servidor Linux</h2>
  <div class="step-box active">
    <div class="step-header">
      <span>1. Configuración de PM2 para el Backend</span>
      <span class="pill pill-green">Producción</span>
    </div>
    <pre>cd /var/www/courtmanager/Backend
npm install --omit=dev
pm2 start server.js --name "courtmanager-api" -i max
pm2 save && pm2 startup</pre>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span>2. Configuración de Nginx con Soporte WebSockets</span>
      <span class="pill pill-blue">Reverse Proxy</span>
    </div>
    <pre>location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}</pre>
  </div>

  <div class="page-break"></div>

  <h2><span class="num">03</span> Estrategia de Respaldo y Recuperación ante Desastres</h2>
  <div class="grid-2">
    <div class="feature-card highlight">
      <div class="feature-title">📦 Respaldo Frío Programado (<code>pg_dump</code>)</div>
      <pre style="margin: 6px 0 0 0; font-size: 7.5pt;">pg_dump "$DATABASE_URL" \\
  -F c -b -v \\
  -f "/var/backups/db_$(date +%Y%m%d).dump"</pre>
      <p class="feature-desc" style="margin-top: 6px;">Se ejecuta diariamente mediante un cron job nocturno y se sincroniza con almacenamiento S3 secundario.</p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">⚡ Rebobinado Instantáneo en Neon</div>
      <p class="feature-desc">Point-in-Time Recovery (PITR) nativo en Neon Cloud. Si un operador elimina accidentalmente datos, la base de datos puede rebobinarse al segundo exacto anterior al error en menos de 2 minutos.</p>
    </div>
  </div>

  <h2><span class="num">04</span> Matriz de Resolución de Incidentes Críticos</h2>
  <table>
    <thead>
      <tr>
        <th>Falla Detectada</th>
        <th>Causa Raíz</th>
        <th>Acción de Mitigación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>502 Bad Gateway</strong></td>
        <td>Proceso Node.js caído por error no capturado.</td>
        <td><code>pm2 reload courtmanager-api</code> y revisar <code>pm2 logs</code>.</td>
      </tr>
      <tr>
        <td><strong>Sockets Caídos</strong></td>
        <td>Falta directiva Upgrade en Nginx.</td>
        <td>Verificar bloque <code>Connection "upgrade"</code> en config de Nginx.</td>
      </tr>
      <tr>
        <td><strong>CORS Denied</strong></td>
        <td>Dominio nuevo no listado en <code>.env</code>.</td>
        <td>Agregar la URL completa en <code>CORS_ORIGINS</code> y recargar.</td>
      </tr>
      <tr>
        <td><strong>Correos en Cola</strong></td>
        <td>Límite diario alcanzado en Brevo.</td>
        <td>Actualizar plan en Brevo o verificar credenciales SMTP.</td>
      </tr>
    </tbody>
  </table>

  <div class="doc-footer">
    <div><strong>CourtManager Tech Solutions</strong> • DevOps & Operations Manual</div>
    <div>Documento de Infraestructura Confidencial © 2026. Todos los derechos reservados.</div>
  </div>
</body>
</html>`;
}

const DOCS = [
  {
    id: 1,
    name: 'FICHA_TECNICA_COMERCIAL',
    title: 'Ficha Técnica Comercial y Propuesta de Valor',
    // Usamos el generador existente de generate_pdf.js si deseamos o el buildHtml de generate_pdf.js
  },
  {
    id: 2,
    name: 'MANUAL_ONBOARDING_IMPLEMENTACION',
    title: 'Manual de Implementación y Onboarding',
    builder: buildHtmlDoc2
  },
  {
    id: 3,
    name: 'ARQUITECTURA_Y_SEGURIDAD_CLOUD',
    title: 'Arquitectura, Seguridad e Infraestructura Cloud',
    builder: buildHtmlDoc3
  },
  {
    id: 4,
    name: 'API_REFERENCE_INTEGRACION',
    title: 'Referencia de la API REST & WebSockets',
    builder: buildHtmlDoc4
  },
  {
    id: 5,
    name: 'MANUAL_DEVOPS_OPERACIONES',
    title: 'Manual de DevOps, Mantenimiento y SLAs',
    builder: buildHtmlDoc5
  }
];

async function compileAll() {
  const browserPath = getBrowserPath();
  if (!browserPath) {
    console.error('❌ Error: No se encontró Chrome o Edge instalado.');
    process.exit(1);
  }

  console.log('🚀 Iniciando compilación de la Suite de Documentación Comercial de CourtManager...');
  console.log('Motor de renderizado:', browserPath);

  for (const doc of DOCS) {
    if (!doc.builder) {
      console.log('⏩ Omitiendo Documento 1 (' + doc.name + '), ya compilado previamente.');
      continue;
    }

    const htmlPath = path.resolve(__dirname, doc.name + '.html');
    const pdfPath = path.resolve(__dirname, doc.name + '.pdf');

    const htmlContent = doc.builder();
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    const cmd = '"' + browserPath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfPath + '" --no-pdf-header-footer "' + fileUrl + '"';

    try {
      execSync(cmd, { stdio: 'pipe' });
      const stats = fs.statSync(pdfPath);
      console.log('✅ [' + doc.id + '/5] ' + doc.title + ' -> ' + doc.name + '.pdf (' + (stats.size / 1024).toFixed(1) + ' KB)');
    } catch (err) {
      console.error('❌ Error al generar ' + doc.name + '.pdf:', err.message);
    }
  }

  console.log('\n🎉 ¡Toda la Suite de Documentación Comercial ha sido generada exitosamente!');
}

compileAll();
