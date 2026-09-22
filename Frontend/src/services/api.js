const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let inMemoryToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

export const setToken = (token) => {
  inMemoryToken = token;
};

export const getToken = () => inMemoryToken;

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Cliente API centralizado para manejar peticiones HTTP con fetch.
 * Utiliza token de acceso en memoria RAM y soporte de cookies HttpOnly con credentials: 'include'.
 * Incluye interceptor automático para renovar token al recibir 401.
 */
async function request(endpoint, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  const config = {
    credentials: 'include',
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  } else if (isFormData) {
    config.body = options.body;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Manejar expiración del access token (401)
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh' && endpoint !== '/auth/logout') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok && refreshData.token) {
          setToken(refreshData.token);
          onRefreshed(refreshData.token);
        } else {
          setToken(null);
          refreshSubscribers = [];
        }
      } catch (err) {
        setToken(null);
        refreshSubscribers = [];
      } finally {
        isRefreshing = false;
      }
    }

    // Reintentar la petición si obtuvimos nuevo token
    if (inMemoryToken) {
      config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
      response = await fetch(`${BASE_URL}${endpoint}`, config);
    }
  }

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
