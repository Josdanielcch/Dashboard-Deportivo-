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
   * Elimina un cliente.
   * @param {string|number} id - ID del cliente.
   * @returns {Promise<object>} Respuesta de la operación.
   */
  delete: async (id) => {
    return api.delete(`/customers/${id}`);
  }
};
