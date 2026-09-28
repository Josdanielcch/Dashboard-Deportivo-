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

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CourtManager — Ficha Técnica Comercial y Propuesta de Valor</title>
  <style>
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
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }

    /* Portada / Header Principal */
    .header-card {
      background: linear-gradient(135deg, #060a1a 0%, #0f1738 100%);
      border-radius: 16px;
      padding: 28px 32px;
      color: #ffffff;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
      border: 1px solid #1e293b;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(204, 255, 0, 0.12);
      border: 1px solid rgba(204, 255, 0, 0.35);
      color: #ccff00;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 12px;
    }

    .header-title {
      font-size: 26pt;
      font-weight: 800;
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title span.accent {
      color: #ccff00;
    }

    .header-subtitle {
      font-size: 12pt;
      color: #94a3b8;
      margin: 0 0 16px 0;
      font-weight: 500;
      max-width: 650px;
    }

    .header-meta {
      display: flex;
      gap: 20px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 9pt;
      color: #cbd5e1;
    }

    .header-meta strong {
      color: #ffffff;
    }

    /* Secciones */
    h2 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      margin: 24px 0 12px 0;
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
      font-size: 9pt;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 800;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 14px 0 6px 0;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      color: #334155;
    }

    /* Diagrama Visual de Flujo de Datos (DFD) */
    .dfd-container {
      background: linear-gradient(135deg, #090e24 0%, #0f1738 100%);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px 16px;
      margin: 12px 0 18px 0;
      color: #f8fafc;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .dfd-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .dfd-title {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #ccff00;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dfd-subtitle {
      font-size: 7.5pt;
      color: #94a3b8;
      font-weight: 600;
    }

    .dfd-flow {
      display: grid;
      grid-template-columns: 1fr auto 1.15fr auto 1fr;
      align-items: stretch;
      gap: 8px;
    }

    .dfd-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 9px;
      padding: 10px 10px;
      display: flex;
      flex-direction: column;
    }

    .dfd-card.core {
      background: rgba(204, 255, 0, 0.04);
      border: 1.5px solid #ccff00;
      box-shadow: 0 0 12px rgba(204, 255, 0, 0.12);
    }

    .dfd-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .dfd-card-title {
      font-weight: 800;
      font-size: 8.5pt;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .dfd-badge {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .dfd-badge-blue {
      background: rgba(56, 189, 248, 0.18);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.35);
    }

    .dfd-badge-volt {
      background: rgba(204, 255, 0, 0.18);
      color: #ccff00;
      border: 1px solid rgba(204, 255, 0, 0.45);
    }

    .dfd-badge-purple {
      background: rgba(192, 132, 252, 0.18);
      color: #c084fc;
      border: 1px solid rgba(192, 132, 252, 0.35);
    }

    .dfd-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4.5px;
    }

    .dfd-list li {
      font-size: 7.5pt;
      color: #cbd5e1;
      display: flex;
      align-items: flex-start;
      gap: 4px;
      line-height: 1.25;
      margin-bottom: 0;
    }

    .dfd-list li::before {
      content: "•";
      color: #ccff00;
      font-weight: bold;
      font-size: 9pt;
      line-height: 0.9;
    }

    .dfd-card.core .dfd-list li::before {
      color: #38bdf8;
    }

    .dfd-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 1px;
    }

    .dfd-arrow {
      color: #ccff00;
      font-size: 12pt;
      font-weight: bold;
      line-height: 1;
    }

    .dfd-conn-label {
      font-size: 6.5pt;
      color: #94a3b8;
      font-weight: 600;
      text-align: center;
      max-width: 58px;
      line-height: 1.15;
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 4px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      white-space: normal;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 14px 0 20px 0;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #0f1738;
      color: #ffffff;
      padding: 10px 14px;
      font-weight: 700;
      text-align: left;
      font-size: 9pt;
      letter-spacing: 0.03em;
    }

    th:first-child { border-top-left-radius: 9px; }
    th:last-child { border-top-right-radius: 9px; }

    td {
      padding: 10px 14px;
      border-top: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Cards Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 12px 0 18px 0;
      page-break-inside: avoid;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin: 12px 0 18px 0;
      page-break-inside: avoid;
    }

    .feature-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .feature-card.highlight {
      border-color: #0f1738;
      background: linear-gradient(to bottom, #ffffff, #f8fafc);
    }

    .feature-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .feature-desc {
      font-size: 9pt;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    /* Badges */
    .pill {
      display: inline-block;
      font-size: 8pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
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

    /* Listas con check */
    ul {
      margin: 6px 0 12px 0;
      padding-left: 20px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
      font-size: 10pt;
    }

    /* Footer */
    .doc-footer {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
      page-break-before: avoid;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Encabezado / Portada -->
  <div class="header-card">
    <div class="header-badge">★ Edición Comercial SaaS v2.0 • Confidencial</div>
    <div class="header-title">Court<span class="accent">Manager</span></div>
    <div class="header-subtitle">
      Plataforma Integral de Gestión Inteligente, Reservas en Tiempo Real y Control Financiero para Centros Deportivos.
    </div>
    <div class="header-meta">
      <div><strong>Mercado:</strong> Pádel, Fútbol 5/7, Tenis & Polideportivos</div>
      <div><strong>Arquitectura:</strong> Cloud Native • Tiempo Real</div>
      <div><strong>Despliegue:</strong> SaaS / On-Premise</div>
      <div><strong>Emisión:</strong> Septiembre 2026</div>
    </div>
  </div>

  <!-- 1. Resumen Ejecutivo -->
  <h2><span class="num">01</span> Resumen Ejecutivo y Propuesta de Valor</h2>
  <p>
    <strong>CourtManager</strong> es una solución de software empresarial (B2B SaaS) diseñada para digitalizar, optimizar y monetizar complejos deportivos de cualquier escala. Elimina por completo la fricción de cuadernos, mensajes dispersos de WhatsApp y hojas de cálculo desactualizadas, centralizando en una sola plataforma:
  </p>
  <ul>
    <li><strong>Portal Web de Autoservicio 24/7:</strong> Para que los jugadores consulten disponibilidad, aparten horarios y paguen en cualquier momento.</li>
    <li><strong>Panel de Recepción y Control Administrativo:</strong> Para administrar turnos, registrar ventas en cantina, controlar caja, multimoneda y visualizar auditoría.</li>
  </ul>

  <!-- DFD / Flujo de Datos Arquitectónico Visual -->
  <div class="dfd-container">
    <div class="dfd-header">
      <div class="dfd-title">
        <span style="font-size: 11pt;">⚡</span> Flujo de Datos y Arquitectura en Tiempo Real (DFD)
      </div>
      <div class="dfd-subtitle">Sincronización Bidireccional Continua (&lt;50ms)</div>
    </div>
    <div class="dfd-flow">
      <!-- 1. Portal Clientes -->
      <div class="dfd-card">
        <div class="dfd-card-header">
          <div class="dfd-card-title">🌐 Portal Clientes</div>
          <span class="dfd-badge dfd-badge-blue">Web 24/7</span>
        </div>
        <ul class="dfd-list">
          <li>Catálogo de Canchas y Turnos</li>
          <li>Selector Dinámico de Horarios</li>
          <li>Checkout Multimoneda (USD/Bs)</li>
          <li>Carga de Capture y Voucher</li>
          <li>Confirmación por Email (SMTP)</li>
        </ul>
      </div>

      <!-- Connector 1 -->
      <div class="dfd-connector">
        <div class="dfd-arrow">⇄</div>
        <div class="dfd-conn-label">Reservas & Pagos</div>
      </div>

      <!-- 2. Cloud Core -->
      <div class="dfd-card core">
        <div class="dfd-card-header">
          <div class="dfd-card-title">☁️ Cloud Core Real-Time</div>
          <span class="dfd-badge dfd-badge-volt">Motor Central</span>
        </div>
        <ul class="dfd-list">
          <li><strong>API REST:</strong> Node.js & Express</li>
          <li><strong>WebSockets:</strong> Socket.IO Bidireccional</li>
          <li><strong>Persistencia:</strong> Neon PostgreSQL Cloud</li>
          <li><strong>Anti-Overbooking:</strong> Bloqueo Atómico</li>
          <li><strong>Notificaciones:</strong> Brevo SMTP Engine</li>
        </ul>
      </div>

      <!-- Connector 2 -->
      <div class="dfd-connector">
        <div class="dfd-arrow">⇄</div>
        <div class="dfd-conn-label">Bloqueo en Vivo</div>
      </div>

      <!-- 3. Panel Admin -->
      <div class="dfd-card">
        <div class="dfd-card-header">
          <div class="dfd-card-title">🖥️ Panel Backoffice</div>
          <span class="dfd-badge dfd-badge-purple">Recepción & Admin</span>
        </div>
        <ul class="dfd-list">
          <li>Cuadrante de Turnos en Vivo</li>
          <li>POS de Mostrador & Stock</li>
          <li>Cálculo de Margen & Ganancia</li>
          <li>Control de Caja Multimoneda</li>
          <li>Auditoría Inmutable de Acciones</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 2. Problema vs Solución -->
  <h2><span class="num">02</span> El Problema del Mercado vs. La Solución CourtManager</h2>
  <p>
    Los centros deportivos no digitalizados pierden entre un <strong>15% y 25% de su facturación potencial</strong> debido a ineficiencias operativas:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 48%;">Gestión Tradicional (WhatsApp / Excel / Libreta)</th>
        <th style="width: 52%;">Solución Inteligente CourtManager</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Pérdida de reservas fuera de horario:</strong> El cliente intenta reservar de noche o fin de semana y nadie atiende.</td>
        <td><strong>Autoservicio Web 24/7:</strong> El cliente reserva y adjunta su pago inmediatamente desde su teléfono o PC.</td>
      </tr>
      <tr>
        <td><strong>Sobreventa (Overbooking):</strong> Turnos duplicados por falta de coordinación entre recepcionistas.</td>
        <td><strong>Sincronización en Tiempo Real:</strong> Bloqueo automático de turnos mediante WebSockets al instante.</td>
      </tr>
      <tr>
        <td><strong>Fugas en Tienda / Cantina:</strong> Pérdida de inventario y desconocimiento del margen real de venta.</td>
        <td><strong>Punto de Venta (POS) Integrado:</strong> Control de stock y cálculo de costo unitario vs. ganancia neta en vivo.</td>
      </tr>
      <tr>
        <td><strong>Complejidad Multimoneda:</strong> Errores manuales al calcular equivalencias entre Dólares, Bolívares y Pesos.</td>
        <td><strong>Motor Multimoneda Automático:</strong> Conversión oficial según la tasa del día guardada en el sistema.</td>
      </tr>
      <tr>
        <td><strong>Falta de Visibilidad Financiera:</strong> Se desconoce la utilidad neta real después de compras y gastos.</td>
        <td><strong>Reportes P&L y Rentabilidad:</strong> Gráficos diarios de ventas, márgenes comerciales y utilidad neta real.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- 3. Módulos de la Suite -->
  <h2><span class="num">03</span> Módulos Principales del Ecosistema</h2>

  <div class="grid-2">
    <div class="feature-card highlight">
      <div class="feature-title">🌐 1. Portal Web de Autoservicio</div>
      <p class="feature-desc">
        Catálogo interactivo de canchas con selector de horarios disponibles, pasarela de pago móvil/transferencia con carga de capture y confirmación automática por correo electrónico (SMTP).
      </p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">📊 2. Dashboard y Recepción en Vivo</div>
      <p class="feature-desc">
        Visualización centralizada de ingresos, reservas activas, ocupación porcentual, campana de notificaciones en tiempo real y píldora discreta de tasa de cambio del día.
      </p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">🛍️ 3. POS e Inventario con Margen</div>
      <p class="feature-desc">
        Venta de mostrador de bebidas y accesorios deportivos. Control de existencias mínimas y cálculo automático de ganancia neta y margen comercial sobre costo.
      </p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">💱 4. Motor Multimoneda Dinámico</div>
      <p class="feature-desc">
        Moneda base Dólar Estadounidense (USD) protegida contra la inflación, con soporte instantáneo para Bolívares (VES), Pesos Colombianos (COP) y actualización en caliente.
      </p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">📑 5. Finanzas, CxC, CxP y Proveedores</div>
      <p class="feature-desc">
        Gestión de créditos a clientes habituales (Cuentas por Cobrar), registro de facturas de proveedores con actualización de stock y Cuentas por Pagar con historial de abonos.
      </p>
    </div>
    <div class="feature-card highlight">
      <div class="feature-title">📈 6. Informes de Rentabilidad (P&L)</div>
      <p class="feature-desc">
        Consulta de ventas por rango de fechas (Hoy, 7 días, Mes o personalizado), desglose de ingresos por cancha vs. productos, ganancia neta, margen % e impresión PDF en 1 clic.
      </p>
    </div>
  </div>

  <div class="feature-card" style="margin-top: 6px;">
    <div class="feature-title">🛡️ 7. Seguridad Industrial, Roles y Auditoría Inmutable</div>
    <p class="feature-desc">
      Control de acceso basado en roles (Administrador vs. Operador de Recepción/Cajero). Bitácora de auditoría detallada que registra cada reserva, anulación, venta y modificación de tasa con usuario, hora y dirección IP para evitar fraudes internos.
    </p>
  </div>

  <!-- 4. Retorno de Inversión -->
  <h2><span class="num">04</span> Retorno de Inversión (ROI) para el Cliente</h2>
  <p>CourtManager genera un impacto económico directo y medible desde el primer mes de uso:</p>

  <table>
    <thead>
      <tr>
        <th>Área de Impacto</th>
        <th>Mecanismo de Retorno</th>
        <th style="text-align: right;">Estimación de Ganancia / Ahorro</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Captación Nocturna / 24/7</strong></td>
        <td>Reservas captadas fuera del horario laboral mediante el portal web.</td>
        <td style="text-align: right;"><span class="pill pill-green">+15% a +25% Ingresos</span></td>
      </tr>
      <tr>
        <td><strong>Eliminación de Inasistencias</strong></td>
        <td>Validación de comprobante previo para confirmar el turno.</td>
        <td style="text-align: right;"><span class="pill pill-green">-90% Canchas Vacías</span></td>
      </tr>
      <tr>
        <td><strong>Control de Merma en Cantina</strong></td>
        <td>Cada producto vendido debe pasar por el POS para descontar stock.</td>
        <td style="text-align: right;"><span class="pill pill-green">Ahorro $150 - $400 / mes</span></td>
      </tr>
      <tr>
        <td><strong>Eficiencia Administrativa</strong></td>
        <td>Generación de reportes financieros y cierres en 1 clic sin hojas de Excel.</td>
        <td style="text-align: right;"><span class="pill pill-blue">~20 hrs / mes Ahorradas</span></td>
      </tr>
    </tbody>
  </table>

  <!-- 5. Especificaciones Técnicas -->
  <h2><span class="num">05</span> Especificaciones Técnicas y Despliegue</h2>
  <div class="grid-3">
    <div class="feature-card">
      <div class="feature-title">💻 Frontend</div>
      <p class="feature-desc">React 19, Tailwind CSS, Lucide Icons, Shadcn UI, Vite. Carga ultra rápida y diseño responsive.</p>
    </div>
    <div class="feature-card">
      <div class="feature-title">⚡ Backend & Realtime</div>
      <p class="feature-desc">Node.js, Express, Socket.IO para sincronización instantánea y Brevo SMTP para mensajería.</p>
    </div>
    <div class="feature-card">
      <div class="feature-title">☁️ Base de Datos</div>
      <p class="feature-desc">PostgreSQL Serverless en Neon Cloud. Alta disponibilidad, backups continuos y cifrado SSL.</p>
    </div>
  </div>

  <!-- 6. Modelos de Comercialización -->
  <h2><span class="num">06</span> Modelos de Comercialización</h2>
  <div class="grid-3">
    <div class="feature-card">
      <div class="feature-title">Plan Básico</div>
      <span class="pill pill-blue">1 a 2 Canchas</span>
      <p class="feature-desc" style="margin-top: 8px;">Reservas en tiempo real, portal web de clientes, control de turnos y reportes básicos.</p>
    </div>
    <div class="feature-card" style="border: 2px solid #0f1738;">
      <div class="feature-title">Plan Pro <span class="pill pill-volt">Más Vendido</span></div>
      <span class="pill pill-green">3 a 6 Canchas</span>
      <p class="feature-desc" style="margin-top: 8px;">Todo lo básico + POS e Inventario con margen, Multimoneda, CxC/CxP, compras y reportes financieros avanzados.</p>
    </div>
    <div class="feature-card">
      <div class="feature-title">Plan Enterprise</div>
      <span class="pill pill-blue">Complejos Grandes</span>
      <p class="feature-desc" style="margin-top: 8px;">Sedes múltiples, auditoría avanzada, soporte técnico prioritario y personalización de marca.</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div><strong>CourtManager Tech Solutions</strong> • Software de Gestión Deportiva</div>
    <div>Documento Comercial Confidencial © 2026. Todos los derechos reservados.</div>
  </div>

</body>
</html>`;
}

async function generate() {
  const browserPath = getBrowserPath();
  if (!browserPath) {
    console.error('No se encontró Chrome o Edge instalado en el sistema.');
    process.exit(1);
  }

  const htmlContent = buildHtml();
  const htmlPath = path.resolve(__dirname, 'FICHA_TECNICA_COMERCIAL.html');
  const pdfPath = path.resolve(__dirname, 'FICHA_TECNICA_COMERCIAL.pdf');

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ Archivo HTML generado:', htmlPath);

  const fileUrl = 'file:///' + htmlPath.replace(/\\\\/g, '/');
  console.log('Generando PDF mediante:', browserPath);

  const cmd = '"' + browserPath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfPath + '" --no-pdf-header-footer "' + fileUrl + '"';
  
  execSync(cmd, { stdio: 'inherit' });

  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('🎉 PDF generado exitosamente: ' + pdfPath + ' (' + (stats.size / 1024).toFixed(1) + ' KB)');
  } else {
    console.error('❌ Error: El PDF no fue generado.');
    process.exit(1);
  }
}

generate();
