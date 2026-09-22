import { api } from './api';

export const paymentService = {
  // Tasas de cambio
  getExchangeRates: async () => {
    return api.get('/exchange-rates');
  },

  updateExchangeRate: async (id, data) => {
    return api.put(`/exchange-rates/${id}`, data);
  },

  bulkUpdateExchangeRates: async (rates) => {
    return api.put('/exchange-rates', { rates });
  },

  // Cuentas / Métodos de pago
  getPaymentAccounts: async () => {
    return api.get('/payment-methods/admin');
  },

  createPaymentAccount: async (data) => {
    return api.post('/payment-methods', data);
  },

  updatePaymentAccount: async (id, data) => {
    return api.put(`/payment-methods/${id}`, data);
  },

  togglePaymentAccount: async (id) => {
    return api.patch(`/payment-methods/${id}/toggle`);
  },

  deletePaymentAccount: async (id) => {
    return api.delete(`/payment-methods/${id}`);
  }
};
