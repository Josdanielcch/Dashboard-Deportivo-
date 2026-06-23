const rateLimit = require('express-rate-limit');

// Limita las solicitudes de login a 5 por cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 peticiones por ventana por IP
  standardHeaders: true, // Retorna los headers de RateLimit en la respuesta
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  handler: (req, res, next, options) => {
    // Calculamos el tiempo exacto que falta para que se levante el bloqueo
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    
    let timeString = '';
    if (minutes > 0) {
      timeString += `${minutes} minuto${minutes > 1 ? 's' : ''} y `;
    }
    timeString += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;

    // Respondemos con el mensaje dinámico
    res.status(options.statusCode).json({
      error: `Demasiados intentos fallidos. Tu acceso ha sido bloqueado temporalmente. Inténtalo de nuevo en ${timeString}.`
    });
  }
});

module.exports = {
  loginLimiter
};
