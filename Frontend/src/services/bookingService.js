import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de reservas (/api/bookings) en el Backend.
 */
export const bookingService = {
  /**
   * Obtiene la lista completa de reservas.
   * @returns {Promise<object>} Respuesta con la lista de reservas en `.data`.
   */
  getAll: async () => {
    return api.get('/bookings');
  },

  /**
   * Obtiene reservas agendadas en una fecha específica (formato YYYY-MM-DD).
   * @param {string} date - Fecha en formato 'YYYY-MM-DD'.
   * @returns {Promise<object>} Respuesta con el listado en `.data`.
   */
  getByDate: async (date) => {
    return api.get(`/bookings/date/${date}`);
  },

  /**
   * Verifica la disponibilidad de una cancha en un rango horario específico.
   * @param {object} params - Parámetros de disponibilidad.
   * @param {string|number} params.court_id - ID de la cancha.
   * @param {string} params.booking_date - Fecha ('YYYY-MM-DD').
   * @param {string} params.start_time - Hora inicio ('HH:MM' o 'HH:MM:SS').
   * @param {string} params.end_time - Hora fin ('HH:MM' o 'HH:MM:SS').
   * @returns {Promise<object>} Respuesta con `.available` (true/false) y `.message`.
   */
  checkAvailability: async ({ court_id, booking_date, start_time, end_time }) => {
    const query = new URLSearchParams({
      court_id: String(court_id),
      booking_date,
      start_time,
      end_time
    }).toString();
    return api.get(`/bookings/check-availability?${query}`);
  },

  /**
   * Registra una nueva reserva.
   * @param {object} bookingData - Datos de la reserva.
   * @param {number} bookingData.customer_id - ID del cliente.
   * @param {number} bookingData.court_id - ID de la cancha.
   * @param {string} bookingData.booking_date - Fecha ('YYYY-MM-DD').
   * @param {string} bookingData.start_time - Hora inicio ('HH:MM').
   * @param {string} bookingData.end_time - Hora fin ('HH:MM').
   * @param {number} bookingData.user_id - ID del usuario de la sesión que registra.
   * @returns {Promise<object>} Respuesta con la reserva creada.
   */
  create: async (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  /**
   * Actualiza el estado de una reserva.
   * @param {string|number} id - ID de la reserva.
   * @param {string} status - Nuevo estado ('Pending', 'Confirmed', 'Cancelled', 'Completed', 'No_show').
   * @returns {Promise<object>} Respuesta con la reserva actualizada.
   */
  updateStatus: async (id, status) => {
    return api.put(`/bookings/${id}/status`, { status });
  },

  /**
   * Obtiene el historial de reservas de un cliente en específico.
   * @param {string|number} customerId - ID del cliente.
   * @returns {Promise<object>} Respuesta con el listado en `.data`.
   */
  getCustomerBookings: async (customerId) => {
    return api.get(`/bookings/customer/${customerId}`);
  }
};
