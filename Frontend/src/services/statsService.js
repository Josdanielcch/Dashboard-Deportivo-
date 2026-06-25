import { api } from './api';

export const statsService = {
  getDashboard: () => api.get('/stats/dashboard'),
};
