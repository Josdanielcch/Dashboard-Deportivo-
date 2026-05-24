const API_URL = 'http://127.0.0.1:3000/api/auth';

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
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al intentar iniciar sesión');
    }
    return data;
  },

  /**
   * Solicita el correo de recuperación de contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  recoverPassword: async (email) => {
    const response = await fetch(`${API_URL}/recover-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al solicitar el enlace de recuperación');
    }
    return data;
  },

  /**
   * Restablece la contraseña utilizando el token de verificación recibido por correo.
   * @param {string} token - Token criptográfico.
   * @param {string} password - Nueva contraseña.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  resetPassword: async (token, password) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al intentar restablecer la contraseña');
    }
    return data;
  },
};
