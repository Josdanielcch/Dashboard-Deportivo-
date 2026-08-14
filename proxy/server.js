/**
 * CourtConnect — Proxy Unificador
 *
 * Estrategia de enrutamiento:
 *   localhost:8080          → Website pública    (puerto 4000)
 *   panel.localhost:8080    → Panel admin        (puerto 5173)
 *   /api/*                  → Backend API        (puerto 3000)
 *
 * Para que panel.localhost funcione en local, añade manualmente (como Administrador):
 *   C:\Windows\System32\drivers\etc\hosts → "127.0.0.1   panel.localhost"
 *
 * Si no deseas modificar el archivo hosts, accede al panel en:
 *   http://localhost:5173  (directo al Vite del Frontend)
 */

const http = require('http');
const httpProxy = require('http-proxy');

// ── Destinos ──────────────────────────────────────────────────────────────────
const TARGETS = {
  website: 'http://localhost:4000',
  panel:   'http://localhost:5173',
  api:     'http://localhost:3000',
};

const PROXY_PORT = process.env.PROXY_PORT || 8080;

// ── Colores para la consola ───────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

// ── Proxy Instance ────────────────────────────────────────────────────────────
const proxy = httpProxy.createProxyServer({
  ws: true,        // WebSocket support (para HMR de Vite y Socket.IO)
  xfwd: true,      // Forwarded headers
  changeOrigin: true,
});

proxy.on('error', (err, req, res) => {
  const target = req._proxyTarget || 'desconocido';
  console.error(`${c.red}[Proxy Error]${c.reset} ${target} → ${err.message}`);
  if (res && res.writeHead && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Proxy Error: el servicio de destino no está disponible.',
      target,
      detail: err.message,
    }));
  }
});

// ── Función de enrutamiento ───────────────────────────────────────────────────
function resolveTarget(req) {
  const host = (req.headers.host || '').toLowerCase();
  const url  = req.url || '/';

  // 1. Rutas de API → Backend siempre
  if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/socket.io')) {
    return { target: TARGETS.api, label: 'API' };
  }

  // 2. Subdominio panel.localhost → Panel admin
  if (host.startsWith('panel.')) {
    return { target: TARGETS.panel, label: 'Panel' };
  }

  // 3. Cualquier otra cosa → Website pública
  return { target: TARGETS.website, label: 'Website' };
}

// ── Servidor HTTP ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const { target, label } = resolveTarget(req);
  req._proxyTarget = target;

  console.log(
    `${c.dim}[${new Date().toLocaleTimeString()}]${c.reset} ` +
    `${c.cyan}${label.padEnd(7)}${c.reset} ` +
    `${c.dim}→${c.reset} ${req.url}`
  );

  proxy.web(req, res, { target });
});

// ── WebSocket (HMR de Vite + Socket.IO) ──────────────────────────────────────
server.on('upgrade', (req, socket, head) => {
  const { target, label } = resolveTarget(req);
  console.log(`${c.yellow}[WS Upgrade]${c.reset} ${label} → ${req.url}`);
  proxy.ws(req, socket, head, { target });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log('');
  console.log(`  ${c.bold}${c.green}CourtConnect Proxy${c.reset} ${c.dim}v1.0${c.reset}`);
  console.log(`  ${'─'.repeat(44)}`);
  console.log(`  ${c.bold}Website pública${c.reset}   ${c.cyan}http://localhost:${PROXY_PORT}${c.reset}`);
  console.log(`  ${c.bold}Panel admin${c.reset}       ${c.cyan}http://panel.localhost:${PROXY_PORT}${c.reset}`);
  console.log(`  ${c.bold}API Backend${c.reset}       ${c.cyan}http://localhost:${PROXY_PORT}/api${c.reset}`);
  console.log(`  ${'─'.repeat(44)}`);
  console.log(`  ${c.dim}Nota: Para usar panel.localhost añade en tu archivo hosts:${c.reset}`);
  console.log(`  ${c.dim}  127.0.0.1   panel.localhost${c.reset}`);
  console.log(`  ${c.dim}  (como Administrador en Windows)${c.reset}`);
  console.log('');
});
