import { api } from './api';

export const purchaseService = {
  getAll: async () => {
    return api.get('/purchases');
  },
  getById: async (id) => {
    return api.get(`/purchases/${id}`);
  },
  create: async (purchaseData) => {
    return api.post('/purchases', purchaseData);
  }
};
