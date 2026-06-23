const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  updateSettings: async (settingsData: any) => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }
};
