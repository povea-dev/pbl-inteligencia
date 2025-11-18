import axios from 'axios';
import { FeedbackRequest, FeedbackResponse, Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 segundos (1 minuto) - optimizado para respuestas más rápidas
});

/**
 * Adapta los mensajes del frontend al formato esperado por el backend
 */
function adaptMessagesForBackend(messages: Message[]): any[] {
  return messages.map(msg => ({
    id: msg.id,
    conversationId: msg.conversationId,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null,
    metadata: {
      tokens: msg.tokens,
      sourcesUsed: msg.sourcesUsed
    }
  }));
}

export const apiService = {
  /**
   * Obtener feedback de la IA con autenticación
   */
  async getFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      // Adaptar los mensajes al formato del backend
      const adaptedHistory = adaptMessagesForBackend(data.conversationHistory);
      
      const requestData = {
        conversationId: data.conversationId,
        courseId: data.courseId,
        message: data.message,
        conversationHistory: adaptedHistory,
        idToken: data.idToken,
        courseFiles: data.courseFiles || [],
        courseTitle: data.courseTitle || ''
      };

      const response = await api.post<FeedbackResponse>('/api/chat/feedback', requestData, {
        headers: {
          'Authorization': `Bearer ${data.idToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo feedback:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  /**
   * Health check del backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error: any) {
      console.error('Health check falló:', error.message || error);
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