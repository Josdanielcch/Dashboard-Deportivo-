// src/middleware/tenantContext.js

/**
 * Middleware para resolución de Inquilino (Multi-Tenancy)
 * Extrae el tenant desde:
 * 1. Header HTTP personalizado: 'X-Tenant-Slug' o 'X-Tenant-ID'
 * 2. Subdominio (ej. 'clubpadel.sportspaces.com' -> 'clubpadel')
 * 3. Usuario autenticado (req.user.tenant_slug)
 * 4. Fallback a 'default'
 */
const tenantContext = (req, res, next) => {
  let tenant = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'];

  if (!tenant && req.headers.host) {
    const hostParts = req.headers.host.split('.');
    // Si tiene subdominio (ej: club.localhost:3000 o club.sportspaces.com)
    if (hostParts.length > 2 && hostParts[0] !== 'www' && hostParts[0] !== 'api') {
      tenant = hostParts[0].toLowerCase();
    }
  }

  if (!tenant && req.user && req.user.tenant_slug) {
    tenant = req.user.tenant_slug;
  }

  req.tenantSlug = (tenant && typeof tenant === 'string' && /^[a-z0-9_-]+$/i.test(tenant)) 
    ? tenant.toLowerCase() 
    : 'default';

  res.setHeader('X-Tenant-Slug', req.tenantSlug);
  next();
};

module.exports = { tenantContext };
