import { api } from './api';

export const settingsService = {
  getSettings: async () => {
    try {
      const data = await api.get('/settings');
      return data;
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  updateSettings: async (settingsData: any) => {
    try {
      const data = await api.put('/settings', settingsData);
      return data;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }
};
