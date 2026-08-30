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
   * Crea una nueva cancha (Solo Administradores).
   * @param {string} courtName - Nombre de la cancha (ej: "Cancha de Fútbol 7").
   * @param {string} [status='Available'] - Estado inicial.
   * @returns {Promise<object>} Respuesta con los datos de la cancha creada.
   */
  create: async (courtName, status = 'Available', sport_id = null, hourly_rate = 0) => {
    return api.post('/courts', { court_name: courtName, status, sport_id, hourly_rate });
  },

  /**
   * Actualiza los datos de una cancha específica.
   * @param {string|number} id - ID de la cancha.
   * @param {object} data - Datos a actualizar.
   * @returns {Promise<object>} Respuesta con la cancha actualizada.
   */
  update: async (id, data) => {
    return api.put(`/courts/${id}`, data);
  },
  /**
   * Elimina una cancha.
   * @param {string|number} id - ID de la cancha a eliminar.
   * @returns {Promise<object>} Respuesta con confirmación.
   */
  delete: async (id) => {
    return api.delete(`/courts/${id}`);
  }
};
