// src/utils/businessConfig.js
// Configuración del negocio — fácilmente reemplazable con valores de BD por empresa
//
// NOTA: En el futuro, estos valores pueden venir de una tabla `business_settings`
// en la base de datos, permitiendo que cada tienda configure sus propios horarios.

module.exports = {
  // Horario de operación (formato 24h)
  openingTime: '08:00',
  closingTime: '22:00',

  // Duración mínima del slot (en minutos)
  // Las reservas se hacen en incrementos de este valor
  slotDurationMinutes: 30,

  // Duraciones permitidas para reservas (en minutos)
  // 30 min, 1h, 1:30h, 2h, 2:30h, 3h
  allowedDurations: [30, 60, 90, 120, 150, 180],

  // Días cerrados (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  closedDays: [0],

  // Nombre del negocio
  businessName: 'SportSpaces',

  // Información de contacto (para el footer del website)
  contact: {
    phone: '+58 412-1234567',
    email: 'info@sportspaces.com',
    address: 'Venezuela',
  },
};
