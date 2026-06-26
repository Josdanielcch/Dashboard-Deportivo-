import { api } from './api';

export const sportService = {
  getAll: async () => {
    return api.get('/sports');
  },
  create: async (data) => {
    return api.post('/sports', data);
  },
  update: async (id, data) => {
    return api.put(`/sports/${id}`, data);
  },
  delete: async (id) => {
    return api.delete(`/sports/${id}`);
  }
};
