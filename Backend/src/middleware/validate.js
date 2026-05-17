const { z } = require('zod');

// Middleware genérico para validar peticiones con Zod
const validate = (schema) => async (req, res, next) => {
  try {
    // Validamos el body, query o params contra el esquema de Zod
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next(); // Si todo está bien, pasamos al siguiente middleware o controlador
  } catch (error) {
    // Si hay un error de validación, enviamos un error 400 Bad Request
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación de datos',
        details: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }
    return res.status(500).json({ error: 'Error interno de validación' });
  }
};

module.exports = { validate };
