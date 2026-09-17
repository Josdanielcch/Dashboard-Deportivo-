import { api } from './api';

export const purchaseService = {
  getAll: async (page = 1, limit = 10, search = '', method = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (method && method !== 'Todos') params.append('method', method);
    return api.get(`/purchases?${params.toString()}`);
  },
  getById: async (id) => {
    return api.get(`/purchases/${id}`);
  },
  create: async (purchaseData) => {
    return api.post('/purchases', purchaseData);
  }
};
