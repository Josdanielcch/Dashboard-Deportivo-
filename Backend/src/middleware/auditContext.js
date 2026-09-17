// src/middleware/auditContext.js
// Middleware que establece el contexto de auditoría en PostgreSQL
// para que los triggers fn_audit_generic() puedan rastrear
// qué usuario realizó cada operación.

const pool = require('../config/database');

const setAuditContext = async (req, res, next) => {
  // Solo configurar si el usuario está autenticado (req.user viene del authMiddleware)
  if (!req.user || !req.user.id) {
    return next();
  }

  let client;
  try {
    client = await pool.connect();
    // SET (sin LOCAL) establece el valor a nivel de SESIÓN.
    // Persiste durante toda la vida de la conexión, incluyendo
    // transacciones BEGIN/COMMIT posteriores en el controller.
    // Se sobreescribe en cada request cuando el pool reutiliza la conexión.
    await client.query('SET app.current_user_id = $1', [req.user.id]);
    // Adjuntar la conexión al request para que los controladores la usen
    req.dbClient = client;
    // Liberar cuando la respuesta termine
    res.on('finish', () => {
      if (req.dbClient) {
        req.dbClient.release();
        req.dbClient = null;
      }
    });
    next();
  } catch (error) {
    console.error('Error setting audit context:', error.message);
    if (client) client.release();
    // No bloquear la request si falla la auditoría
    next();
  }
};

module.exports = { setAuditContext };
