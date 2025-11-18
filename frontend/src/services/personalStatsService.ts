import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PersonalStats, Message, Conversation } from '../types';
import { format, startOfDay, parseISO, getHours } from 'date-fns';

/**
 * Servicio para obtener estadísticas personales de estudiantes
 */
export const personalStatsService = {
  /**
   * Obtiene las estadísticas personales de un estudiante
   */
  async getPersonalStats(
    userId: string,
    courseId?: string
  ): Promise<PersonalStats> {
    // Obtener todas las conversaciones del estudiante
    const conversationsRef = collection(db, 'conversations');
    let conversationsQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    if (courseId) {
      conversationsQuery = query(
        conversationsRef,
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('status', '==', 'active')
      );
    }

    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations: Conversation[] = conversationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() || new Date(),
      } as Conversation;
    });

    // Obtener todos los mensajes del estudiante
    const allMessages: Message[] = [];
    const messagesByDay: Map<string, number> = new Map();
    const conversationsByDay: Map<string, number> = new Map();
    const activityByHour: Map<number, number> = new Map();
    const topicCounts: Map<string, number> = new Map();

    for (const conv of conversations) {
      const messagesRef = collection(db, 'courses', conv.courseId, 'conversations', conv.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const convMessages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        } as Message;
      });

      allMessages.push(...convMessages);

      // Agrupar por día
      convMessages.forEach(msg => {
        const dayKey = format(startOfDay(msg.timestamp), 'yyyy-MM-dd');
        messagesByDay.set(dayKey, (messagesByDay.get(dayKey) || 0) + 1);
        
        const hour = getHours(msg.timestamp);
        activityByHour.set(hour, (activityByHour.get(hour) || 0) + 1);
      });

      // Agrupar conversaciones por día
      const convDayKey = format(startOfDay(conv.createdAt), 'yyyy-MM-dd');
      conversationsByDay.set(convDayKey, (conversationsByDay.get(convDayKey) || 0) + 1);

      // Extraer temas básicos (palabras clave de los títulos)
      const words = conv.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => {
        topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
      });
    }

    // Calcular tiempo total (estimado: 2 minutos por mensaje)
    const totalTimeSpent = allMessages.length * 2;

    // Convertir Maps a Arrays ordenados
    const messagesByDayArray = Array.from(messagesByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const conversationsByDayArray = Array.from(conversationsByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const activityByHourArray = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: activityByHour.get(hour) || 0
    }));

    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalMessages: allMessages.length,
      totalConversations: conversations.length,
      averageMessagesPerConversation: conversations.length > 0 
        ? Math.round((allMessages.length / conversations.length) * 10) / 10 
        : 0,
      totalTimeSpent,
      messagesByDay: messagesByDayArray,
      conversationsByDay: conversationsByDayArray,
      topTopics,
      activityByHour: activityByHourArray,
    };
  }
};

