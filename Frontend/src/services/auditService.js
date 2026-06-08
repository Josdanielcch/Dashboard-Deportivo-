import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de auditoría (/api/audit) en el Backend.
 * Solo accesible para administradores y supervisores.
 */
export const auditService = {
  /**
   * Obtiene los logs de auditoría con filtros opcionales.
   * @param {object} [filters] - Filtros opcionales.
   * @param {string} [filters.table_name] - Filtrar por nombre de tabla.
   * @param {number} [filters.user_id] - Filtrar por ID de usuario.
   * @param {number} [filters.limit] - Límite de resultados (default 100).
   * @param {number} [filters.offset] - Offset para paginación.
   * @returns {Promise<object>} Respuesta con la lista de logs en `.data`.
   */
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.table_name) params.append('table_name', filters.table_name);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    return api.get(`/audit${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Obtiene el historial de auditoría de un registro específico.
   * @param {string} tableName - Nombre de la tabla.
   * @param {string|number} recordId - ID del registro.
   * @returns {Promise<object>} Respuesta con los logs del registro.
   */
  getByRecord: async (tableName, recordId) => {
    return api.get(`/audit/${tableName}/${recordId}`);
  }
};
