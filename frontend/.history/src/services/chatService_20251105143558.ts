import { apiService } from './apiService';

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export const chatService = {
  async sendMessage(
    sessionId: string,
    problemId: string,
    studentResponse: string,
    history: Message[]
  ): Promise<string> {
    try {
      const response = await apiService.getFeedback({
        sessionId,
        problemId,
        studentResponse,
        conversationHistory: history
      });
      
      return response.feedback;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};