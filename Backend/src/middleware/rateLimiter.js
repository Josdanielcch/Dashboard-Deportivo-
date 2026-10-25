const rateLimit = require('express-rate-limit');

// Limita las solicitudes de login a 5 por cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 peticiones por ventana por IP
  standardHeaders: true, // Retorna los headers de RateLimit en la respuesta
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  skip: () => process.env.NODE_ENV === 'test',
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

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 peticiones por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Demasiadas solicitudes. Inténtalo de nuevo en un minuto.'
  }
});

// Limita solicitudes de recuperación de contraseñas y registro para evitar spam y abuso
const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 peticiones por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;

    let timeString = '';
    if (minutes > 0) {
      timeString += `${minutes} minuto${minutes > 1 ? 's' : ''} y `;
    }
    timeString += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;

    res.status(options.statusCode).json({
      error: `Has alcanzado el límite de intentos para esta acción. Por favor intenta de nuevo en ${timeString}.`
    });
  }
});

// Limita solicitudes de creación de reservas para prevenir spam y bloqueo masivo de turnos
const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 15, // Máximo 15 solicitudes de reserva por cada 5 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: 'Has alcanzado el límite de intentos de reserva. Por favor espera unos minutos antes de crear otra reserva.'
    });
  }
});

module.exports = {
  loginLimiter,
  apiLimiter,
  authActionLimiter,
  bookingLimiter
};

