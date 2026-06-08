import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de facturación (/api/billings) en el Backend.
 */
export const billingService = {
  /**
   * Obtiene la lista completa de facturas registradas.
   * @returns {Promise<object>} Respuesta con la lista de facturas en `.data`.
   */
  getAll: async () => {
    return api.get('/billings');
  },

  /**
   * Obtiene los detalles de una factura específica (incluye sale_details).
   * @param {string|number} id - ID de la factura.
   * @returns {Promise<object>} Respuesta con los datos de la factura y sus detalles.
   */
  getById: async (id) => {
    return api.get(`/billings/${id}`);
  },

  /**
   * Crea una nueva factura con productos y/o reserva.
   * @param {object} billingData - Datos de la factura.
   * @param {number} billingData.customer_id - ID del cliente.
   * @param {number} billingData.user_id - ID del usuario cajero.
   * @param {number} billingData.payment_method_id - ID del método de pago.
   * @param {number} [billingData.booking_id] - ID de la reserva asociada (opcional).
   * @param {Array} [billingData.products] - Lista de productos [{product_id, quantity}].
   * @returns {Promise<object>} Respuesta con los datos de la factura creada.
   */
  create: async (billingData) => {
    return api.post('/billings', billingData);
  }
};
