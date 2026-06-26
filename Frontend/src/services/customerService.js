import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de clientes (/api/customers) en el Backend.
 */
export const customerService = {
  /**
   * Obtiene la lista completa de clientes registrados.
   * @returns {Promise<object>} Respuesta con la lista de clientes en `.data`.
   */
  getAll: async () => {
    return api.get('/customers');
  },

  /**
   * Busca clientes según una consulta (ej: nombre, cédula).
   * @param {string} query - Término de búsqueda.
   * @returns {Promise<object>} Respuesta con los clientes encontrados.
   */
  search: async (query) => {
    return api.get(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Obtiene los detalles de un cliente específico.
   * @param {string|number} id - ID del cliente.
   * @returns {Promise<object>} Respuesta con los datos del cliente.
   */
  getById: async (id) => {
    return api.get(`/customers/${id}`);
  },

  /**
   * Registra un nuevo cliente.
   * @param {object} customerData - Datos del cliente.
   * @param {string} customerData.full_name - Nombre completo.
   * @param {string} customerData.phone - Teléfono de contacto.
   * @param {string} customerData.email - Correo electrónico.
   * @param {string} [customerData.identification_number] - Cédula o número de documento.
   * @returns {Promise<object>} Respuesta con los datos del cliente creado.
   */
  create: async (customerData) => {
    return api.post('/customers', customerData);
  },

  /**
   * Actualiza los datos de un cliente existente.
   * @param {string|number} id - ID del cliente.
   * @param {object} customerData - Datos a actualizar.
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  update: async (id, customerData) => {
    return api.put(`/customers/${id}`, customerData);
  },

  /**
   * Registra un pago/abono sobre la deuda pendiente de un cliente.
   * @param {string|number} id - ID del cliente.
   * @param {number} amount - Monto a descontar de la deuda.
   * @returns {Promise<object>} Respuesta con el nuevo saldo del cliente.
   */
  recordPayment: async (id, amount) => {
    return api.post(`/customers/${id}/pay`, { amount });
  },

  /**
   * Elimina un cliente.
   * @param {string|number} id - ID del cliente.
   * @returns {Promise<object>} Respuesta de la operación.
   */
  delete: async (id) => {
    return api.delete(`/customers/${id}`);
  }
};
