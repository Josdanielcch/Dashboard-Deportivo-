import { api } from './api';

export const supplierService = {
  getAll: async () => {
    return api.get('/suppliers');
  },
  getById: async (id) => {
    return api.get(`/suppliers/${id}`);
  },
  create: async (supplierData) => {
    return api.post('/suppliers', supplierData);
  },
  update: async (id, supplierData) => {
    return api.put(`/suppliers/${id}`, supplierData);
  }
};
