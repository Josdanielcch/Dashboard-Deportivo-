import { api } from './api';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
