import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

export const apiService = {
  async getFeedback(data: any): Promise<any> {
    try {
      const response = await api.post('/api/feedback', data);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo feedback:', error);
      throw error;
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
};