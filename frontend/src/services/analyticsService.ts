import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StudentActivity, FrequentQuestion } from '../types';

export const analyticsService = {
  /**
   * Obtener actividad de estudiantes en un curso
   */
  async getStudentActivity(courseId: string): Promise<StudentActivity[]> {
    try {
      const conversationsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'conversations')
      );
      
      // Agrupar por estudiante
      const activityMap = new Map<string, StudentActivity>();
      
      for (const convDoc of conversationsSnapshot.docs) {
        const conv = convDoc.data();
        
        // Solo contar estudiantes
        if (conv.userRole !== 'student') continue;
        
        const studentId = conv.userId;
        
        if (!activityMap.has(studentId)) {
          activityMap.set(studentId, {
            studentId,
            studentEmail: 'Cargando...', // Se actualizará después
            totalMessages: 0,
            conversationsCount: 0,
            lastActivity: new Date(0),
            topTopics: []
          });
        }
        
        const activity = activityMap.get(studentId)!;
        activity.conversationsCount++;
        activity.totalMessages += conv.messageCount || 0;
        
        const lastMessageAt = (conv.lastMessageAt as Timestamp)?.toDate() || new Date(0);
        if (lastMessageAt > activity.lastActivity) {
          activity.lastActivity = lastMessageAt;
        }
      }
      
      return Array.from(activityMap.values());
    } catch (error) {
      console.error('Error obteniendo actividad de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener preguntas más frecuentes
   */
  async getFrequentQuestions(courseId: string): Promise<FrequentQuestion[]> {
    try {
      // Obtener todas las conversaciones
      const conversationsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'conversations')
      );
      
      const questions: FrequentQuestion[] = [];
      
      for (const convDoc of conversationsSnapshot.docs) {
        const conv = convDoc.data();
        
        // Obtener el primer mensaje de cada conversación (pregunta inicial)
        const messagesSnapshot = await getDocs(
          query(
            collection(db, 'courses', courseId, 'conversations', convDoc.id, 'messages'),
            where('role', '==', 'user'),
            orderBy('timestamp', 'asc'),
            limit(1)
          )
        );
        
        if (!messagesSnapshot.empty) {
          const firstMessage = messagesSnapshot.docs[0].data();
          
          questions.push({
            id: convDoc.id,
            question: firstMessage.content.slice(0, 100), // Primeros 100 caracteres
            count: 1,
            lastAsked: (conv.lastMessageAt as Timestamp)?.toDate() || new Date(),
            askedBy: [conv.userId]
          });
        }
      }
      
      // Agrupar preguntas similares (simplificado)
      // En producción, usarías embeddings o NLP para agrupar mejor
      return questions.slice(0, 10); // Top 10
    } catch (error) {
      console.error('Error obteniendo preguntas frecuentes:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas generales del curso
   */
  async getCourseStats(courseId: string) {
    try {
      const conversationsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'conversations')
      );

      let totalMessages = 0;
      const activeStudents = new Set<string>();
      const totalConversations = conversationsSnapshot.docs.length;
      
      conversationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalMessages += data.messageCount || 0;
        
        if (data.userRole === 'student') {
          activeStudents.add(data.userId);
        }
      });
      
      return {
        totalConversations,
        totalMessages,
        activeStudents: activeStudents.size,
        avgMessagesPerConversation: totalConversations > 0 
          ? Math.round(totalMessages / totalConversations) 
          : 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del curso:', error);
      throw error;
    }
  },

  /**
   * Obtener actividad reciente (últimos 7 días)
   */
  async getRecentActivity(courseId: string, days: number = 7) {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      
      const q = query(
        collection(db, 'courses', courseId, 'conversations'),
        where('lastMessageAt', '>=', Timestamp.fromDate(daysAgo)),
        orderBy('lastMessageAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        conversationId: doc.id,
        userId: doc.data().userId,
        userRole: doc.data().userRole,
        title: doc.data().title,
        messageCount: doc.data().messageCount || 0,
        lastActivity: (doc.data().lastMessageAt as Timestamp)?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      throw error;
    }
  }
};