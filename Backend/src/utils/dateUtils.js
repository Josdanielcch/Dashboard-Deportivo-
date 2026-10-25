// src/utils/dateUtils.js
const pool = require('../config/database');

let cachedTimezone = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la zona horaria oficial del complejo deportivo configurada en la base de datos.
 * Utiliza caché en memoria para no consultar la base de datos en cada request.
 */
const getBusinessTimezone = async () => {
  const now = Date.now();
  if (cachedTimezone && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedTimezone;
  }

  try {
    const result = await pool.query('SELECT timezone FROM business_settings LIMIT 1');
    if (result.rows.length > 0 && result.rows[0].timezone) {
      cachedTimezone = result.rows[0].timezone;
      lastCacheTime = now;
      return cachedTimezone;
    }
  } catch (_) {
    // Si la tabla o columna aún no existe, fallback
  }

  cachedTimezone = process.env.APP_TIMEZONE || 'America/Caracas';
  lastCacheTime = now;
  return cachedTimezone;
};

/**
 * Obtiene la fecha y hora actual en la zona horaria del complejo deportivo.
 */
const getNowInTimezone = (timezone = 'America/Caracas') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const getPart = (type) => parts.find(p => p.type === type)?.value || '00';
    const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const timeStr = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
    
    return {
      date: dateStr,
      time: timeStr,
      fullComparable: `${dateStr}T${timeStr}`
    };
  } catch (err) {
    // Fallback a hora local del sistema si la zona horaria es inválida
    const now = new Date();
    const iso = now.toISOString();
    return {
      date: iso.slice(0, 10),
      time: iso.slice(11, 19),
      fullComparable: iso.slice(0, 19)
    };
  }
};

/**
 * Valida si una fecha y hora de reserva se encuentra en el pasado respecto a la sede deportiva.
 * @param {string} bookingDate - 'YYYY-MM-DD'
 * @param {string} startTime - 'HH:mm' o 'HH:mm:ss'
 * @param {string} timezone - 'America/Caracas', 'Europe/Madrid', etc.
 * @returns {boolean} true si ya pasó
 */
const isPastDateTime = (bookingDate, startTime, timezone = 'America/Caracas') => {
  const current = getNowInTimezone(timezone);
  const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
  const requestedComparable = `${bookingDate}T${formattedStartTime}`;

  return requestedComparable < current.fullComparable;
};

module.exports = {
  getBusinessTimezone,
  getNowInTimezone,
  isPastDateTime
};
