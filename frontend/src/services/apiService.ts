import axios from 'axios';
import { FeedbackRequest, FeedbackResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 segundos para procesamiento de archivos
});

export const apiService = {
  /**
   * Obtener feedback de la IA con autenticación
   */
  async getFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const response = await api.post<FeedbackResponse>('/api/chat/feedback', data, {
        headers: {
          'Authorization': `Bearer ${data.idToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo feedback:', error);
      throw error;
    }
  },

  /**
   * Health check del backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  /**
   * Procesar archivos del curso (crear embeddings)
   */
  async processFiles(courseId: string, idToken: string): Promise<void> {
    try {
      await api.post(
        `/api/courses/${courseId}/process-files`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
    } catch (error) {
      console.error('Error procesando archivos:', error);
      throw error;
    }
  }
};