// src/utils/venezuelanHolidays.js
// Módulo de días festivos oficiales de Venezuela
// Incluye festivos fijos, Semana Santa y Carnaval (calculados dinámicamente)

/**
 * Calcula la fecha del Domingo de Pascua usando el algoritmo de Butcher.
 * @param {number} year - Año para calcular
 * @returns {Date} Fecha del Domingo de Pascua
 */
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Agrega o resta días a una fecha.
 * @param {Date} date - Fecha base
 * @param {number} days - Días a agregar (negativo para restar)
 * @returns {Date} Nueva fecha
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formatea una fecha a string YYYY-MM-DD.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Obtiene todos los días festivos de Venezuela para un año dado.
 * @param {number} year
 * @returns {Array<{date: string, name: string}>}
 */
function getHolidaysForYear(year) {
  const holidays = [];

  // ═══════════════════════════════════════════
  // FESTIVOS FIJOS (se repiten cada año)
  // ═══════════════════════════════════════════
  const fixedHolidays = [
    { month: 1, day: 1, name: 'Año Nuevo' },
    { month: 4, day: 19, name: 'Declaración de la Independencia' },
    { month: 5, day: 1, name: 'Día del Trabajador' },
    { month: 6, day: 24, name: 'Batalla de Carabobo' },
    { month: 7, day: 5, name: 'Día de la Independencia' },
    { month: 7, day: 24, name: 'Natalicio de Simón Bolívar' },
    { month: 10, day: 12, name: 'Día de la Resistencia Indígena' },
    { month: 12, day: 24, name: 'Nochebuena' },
    { month: 12, day: 25, name: 'Navidad' },
    { month: 12, day: 31, name: 'Fin de Año' },
  ];

  fixedHolidays.forEach(({ month, day, name }) => {
    holidays.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      name,
    });
  });

  // ═══════════════════════════════════════════
  // SEMANA SANTA (móvil - basada en Pascua)
  // ═══════════════════════════════════════════
  const easter = getEasterSunday(year);

  const holyWeekDays = [
    { offset: -6, name: 'Lunes Santo' },
    { offset: -5, name: 'Martes Santo' },
    { offset: -4, name: 'Miércoles Santo' },
    { offset: -3, name: 'Jueves Santo' },
    { offset: -2, name: 'Viernes Santo' },
  ];

  holyWeekDays.forEach(({ offset, name }) => {
    const date = addDays(easter, offset);
    holidays.push({ date: formatDate(date), name });
  });

  // ═══════════════════════════════════════════
  // CARNAVAL (Lunes y Martes antes de Miércoles de Ceniza)
  // Miércoles de Ceniza = Pascua - 46 días
  // ═══════════════════════════════════════════
  const ashWednesday = addDays(easter, -46);
  const carnivalMonday = addDays(ashWednesday, -2);
  const carnivalTuesday = addDays(ashWednesday, -1);

  holidays.push({ date: formatDate(carnivalMonday), name: 'Lunes de Carnaval' });
  holidays.push({ date: formatDate(carnivalTuesday), name: 'Martes de Carnaval' });

  // Ordenar por fecha
  holidays.sort((a, b) => a.date.localeCompare(b.date));

  return holidays;
}

/**
 * Verifica si una fecha es un día festivo en Venezuela.
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {boolean}
 */
function isVenezuelanHoliday(dateString) {
  const year = parseInt(dateString.split('-')[0], 10);
  const holidays = getHolidaysForYear(year);
  return holidays.some((h) => h.date === dateString);
}

/**
 * Obtiene el nombre del día festivo si la fecha es festiva.
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {string|null}
 */
function getHolidayName(dateString) {
  const year = parseInt(dateString.split('-')[0], 10);
  const holidays = getHolidaysForYear(year);
  const found = holidays.find((h) => h.date === dateString);
  return found ? found.name : null;
}

module.exports = {
  getHolidaysForYear,
  isVenezuelanHoliday,
  getHolidayName,
};
