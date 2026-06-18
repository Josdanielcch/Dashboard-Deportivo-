import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de usuarios (/api/users) en el Backend.
 * Todas las rutas requieren autenticación y rol de Administrador.
 */
export const userService = {
  /**
   * Obtiene la lista completa de usuarios del sistema.
   * @returns {Promise<object>} Respuesta con la lista de usuarios en `.data`.
   */
  getAll: async () => {
    return api.get('/users');
  },

  /**
   * Obtiene los detalles de un usuario específico.
   * @param {string|number} id - ID del usuario.
   * @returns {Promise<object>} Respuesta con los datos del usuario.
   */
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * @param {object} userData - Datos del usuario.
   * @param {string} userData.username - Nombre de usuario (mínimo 3 caracteres).
   * @param {string} userData.password - Contraseña (mínimo 6 caracteres).
   * @param {string} userData.full_name - Nombre completo (mínimo 3 caracteres).
   * @param {number} [userData.role_id] - ID del rol (por defecto 1).
   * @returns {Promise<object>} Respuesta con los datos del usuario creado.
   */
  create: async (userData) => {
    return api.post('/users', userData);
  },

  /**
   * Actualiza los datos de un usuario existente.
   * @param {string|number} id - ID del usuario.
   * @param {object} userData - Datos a actualizar (full_name, role_id, status).
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Actualiza el estado de un usuario (Activated / Disabled).
   * @param {string|number} id - ID del usuario.
   * @param {string} status - Nuevo estado ('Activated' o 'Disabled').
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  updateStatus: async (id, status) => {
    return api.patch(`/users/${id}/status`, { status });
  },

  /**
   * Deshabilita (soft delete) un usuario del sistema.
   * @param {string|number} id - ID del usuario.
   * @returns {Promise<object>} Respuesta confirmando la deshabilitación.
   */
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Actualiza los datos del usuario logueado actualmente.
   * @param {object} userData - Datos a actualizar (first_name, last_name, password).
   */
  updateMyProfile: async (userData) => {
    return api.put('/users/profile', userData);
  }
};
