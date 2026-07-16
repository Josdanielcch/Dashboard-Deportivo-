const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Cliente API centralizado para manejar peticiones HTTP con fetch.
 * Adjunta automáticamente el token JWT si está disponible en localStorage.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  // Manejar respuestas sin contenido (204 No Content)
  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Ocurrió un error al procesar la petición');
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
