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
   * Registra un nuevo usuario en el sistema.
   * @param {object} userData - Datos del usuario.
   * @param {string} userData.username - Nombre de usuario (mínimo 3 caracteres).
   * @param {string} userData.password - Contraseña (mínimo 6 caracteres).
   * @param {string} userData.first_name - Nombre (mínimo 3 caracteres).
   * @param {string} userData.last_name - Apellido (mínimo 3 caracteres).
   * @param {number} [userData.role_id] - ID del rol (por defecto 1).
   * @returns {Promise<object>} Respuesta con los datos del usuario creado.
   */
  create: async (userData) => {
    return api.post('/users', userData);
  },

  /**
   * Actualiza los datos de un usuario existente.
   * @param {string|number} id - ID del usuario.
   * @param {object} userData - Datos a actualizar (first_name, last_name, role_id, status).
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Actualiza los datos del usuario logueado actualmente.
   * @param {object} userData - Datos a actualizar (first_name, last_name, password).
   */
  updateMyProfile: async (userData) => {
    return api.put('/users/profile', userData);
  },

  /**
   * Sube o actualiza la foto de avatar de un usuario.
   * @param {string|number} id - ID del usuario.
   * @param {FormData} formData - Objeto FormData con el archivo en la clave 'avatar'.
   * @returns {Promise<object>} Respuesta con la URL del nuevo avatar.
   */
  uploadAvatar: async (id, formData) => {
    return api.post(`/users/${id}/avatar`, formData);
  }
};
