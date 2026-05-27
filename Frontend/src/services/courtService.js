import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de canchas (/api/courts) en el Backend.
 */
export const courtService = {
  /**
   * Obtiene la lista completa de canchas del sistema.
   * @returns {Promise<object>} Respuesta con la lista de canchas en `.data`.
   */
  getAll: async () => {
    return api.get('/courts');
  },

  /**
   * Obtiene los detalles de una cancha específica por ID.
   * @param {string|number} id - ID de la cancha.
   * @returns {Promise<object>} Respuesta con los datos de la cancha en `.data`.
   */
  getById: async (id) => {
    return api.get(`/courts/${id}`);
  },

  /**
   * Crea una nueva cancha (Solo Administradores).
   * @param {string} courtName - Nombre de la cancha (ej: "Cancha de Fútbol 7").
   * @param {string} [status='Available'] - Estado inicial.
   * @returns {Promise<object>} Respuesta con los datos de la cancha creada.
   */
  create: async (courtName, status = 'Available') => {
    return api.post('/courts', { court_name: courtName, status });
  },

  /**
   * Actualiza el estado de una cancha específica (Solo Administradores).
   * @param {string|number} id - ID de la cancha.
   * @param {string} status - Nuevo estado ('Available', 'Occupied', 'Maintenance', 'Out_of_service').
   * @returns {Promise<object>} Respuesta con los datos de la cancha actualizada.
   */
  updateStatus: async (id, status) => {
    return api.put(`/courts/${id}/status`, { status });
  }
};
