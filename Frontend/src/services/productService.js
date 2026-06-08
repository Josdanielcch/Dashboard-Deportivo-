import { api } from './api';

/**
 * Servicio para interactuar con los endpoints de productos (/api/products) en el Backend.
 */
export const productService = {
  /**
   * Obtiene la lista completa de productos registrados.
   * @returns {Promise<object>} Respuesta con la lista de productos en `.data`.
   */
  getAll: async () => {
    return api.get('/products');
  },

  /**
   * Obtiene los detalles de un producto específico.
   * @param {string|number} id - ID del producto.
   * @returns {Promise<object>} Respuesta con los datos del producto.
   */
  getById: async (id) => {
    return api.get(`/products/${id}`);
  },

  /**
   * Registra un nuevo producto.
   * @param {object} productData - Datos del producto.
   * @param {string} productData.product_name - Nombre del producto.
   * @param {number} productData.price - Precio unitario.
   * @param {number} [productData.stock] - Stock inicial (por defecto 0).
   * @returns {Promise<object>} Respuesta con los datos del producto creado.
   */
  create: async (productData) => {
    return api.post('/products', productData);
  },

  /**
   * Actualiza los datos de un producto existente.
   * @param {string|number} id - ID del producto.
   * @param {object} productData - Datos a actualizar.
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  update: async (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  /**
   * Ajusta el stock de un producto (sumar o restar).
   * @param {string|number} id - ID del producto.
   * @param {number} quantity - Cantidad a ajustar (positivo para sumar, negativo para restar).
   * @returns {Promise<object>} Respuesta con los datos actualizados.
   */
  updateStock: async (id, quantity) => {
    return api.patch(`/products/${id}/stock`, { quantity });
  }
};
