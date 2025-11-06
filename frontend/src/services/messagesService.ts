import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';

export const messagesService = {
  /**
   * Guardar un mensaje en una conversación
   */
  async saveMessage(
    courseId: string,
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: {
      tokens?: { prompt: number; completion: number; total: number };
      sourcesUsed?: string[];
    }
  ): Promise<string> {
    try {
      const messageRef = await addDoc(
        collection(db, 'courses', courseId, 'conversations', conversationId, 'messages'),
        {
          role,
          content,
          timestamp: serverTimestamp(),
          tokens: metadata?.tokens || null,
          sourcesUsed: metadata?.sourcesUsed || []
        }
      );
      
      return messageRef.id;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los mensajes de una conversación
   */
  async getMessages(
    courseId: string,
    conversationId: string
  ): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'courses', courseId, 'conversations', conversationId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId,
        role: doc.data().role,
        content: doc.data().content,
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date(),
        tokens: doc.data().tokens || undefined,
        sourcesUsed: doc.data().sourcesUsed || []
      }));
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      throw error;
    }
  },

  /**
   * Suscribirse a mensajes en tiempo real
   */
  subscribeToMessages(
    courseId: string,
    conversationId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'courses', courseId, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            conversationId,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date(),
            tokens: data.tokens || undefined,
            sourcesUsed: data.sourcesUsed || []
          };
        });
        
        callback(messages);
      },
      (error) => {
        console.error('Error en suscripción de mensajes:', error);
      }
    );
  },

  /**
   * Obtener últimos N mensajes (para contexto de IA)
   */
  async getRecentMessages(
    courseId: string,
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    try {
      const allMessages = await this.getMessages(courseId, conversationId);
      return allMessages.slice(-limit); // Últimos N mensajes
    } catch (error) {
      console.error('Error obteniendo mensajes recientes:', error);
      throw error;
    }
  }
};