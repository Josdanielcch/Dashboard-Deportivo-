import { api } from './api';

/**
 * Servicio de Autenticación para interactuar con la API del Backend.
 */
export const authService = {
  /**
   * Inicia sesión con el usuario y contraseña especificados.
   * @param {string} username - Nombre de usuario.
   * @param {string} password - Contraseña.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  login: async (username, password) => {
    return api.post('/auth/login', { username, password });
  },

  /**
   * Renueva el Access Token usando la cookie HttpOnly panel_refresh_token.
   * @returns {Promise<object>} Respuesta del servidor con nuevo token.
   */
  refreshToken: async () => {
    return api.post('/auth/refresh');
  },

  /**
   * Cierra la sesión en el servidor y limpia la cookie HttpOnly.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  logout: async () => {
    return api.post('/auth/logout');
  },

  /**
   * Solicita el correo de recuperación de contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  recoverPassword: async (email) => {
    return api.post('/auth/recover-password', { email });
  },

  /**
   * Restablece la contraseña utilizando el token de verificación recibido por correo.
   * @param {string} token - Token criptográfico.
   * @param {string} password - Nueva contraseña.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  resetPassword: async (token, password) => {
    return api.post('/auth/reset-password', { token, password });
  },
};
