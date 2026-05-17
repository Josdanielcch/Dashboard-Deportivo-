// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.code) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({ error: 'Registro duplicado', code: err.code });
      case '23503':
        return res.status(400).json({ error: 'Violación de clave foránea', code: err.code });
      default:
        return res.status(500).json({ error: 'Error de base de datos', code: err.code });
    }
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };