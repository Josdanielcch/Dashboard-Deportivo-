import { api } from './api';

export const cxpService = {
  getAll: async () => {
    return api.get('/cxp');
  },
  getById: async (id) => {
    return api.get(`/cxp/${id}`);
  },
  addPayment: async (id, paymentData) => {
    return api.post(`/cxp/${id}/payments`, paymentData);
  }
};
