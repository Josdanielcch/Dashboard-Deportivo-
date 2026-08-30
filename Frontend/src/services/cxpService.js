import { api } from './api';

export const cxpService = {
  getAll: async () => {
    return api.get('/cxp');
  },
  addPayment: async (id, paymentData) => {
    return api.post(`/cxp/${id}/payments`, paymentData);
  }
};
