import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp,
  orderBy,
  limit,
  doc,
  getDoc
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
      const studentIds = new Set<string>();
      
      for (const convDoc of conversationsSnapshot.docs) {
        const conv = convDoc.data();
        
        // Solo contar estudiantes
        if (conv.userRole !== 'student') continue;
        
        const studentId = conv.userId;
        studentIds.add(studentId);
        
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
      
      // Obtener información de los estudiantes desde Firestore
      const studentInfoPromises = Array.from(studentIds).map(async (studentId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', studentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              studentId,
              email: userData.email || 'Sin email',
              displayName: userData.displayName || userData.firstName && userData.lastName 
                ? `${userData.firstName} ${userData.lastName}`.trim()
                : userData.email || 'Estudiante'
            };
          }
          return { studentId, email: 'Usuario no encontrado', displayName: 'Usuario no encontrado' };
        } catch (error) {
          console.error(`Error obteniendo info del estudiante ${studentId}:`, error);
          return { studentId, email: 'Error al cargar', displayName: 'Error al cargar' };
        }
      });
      
      const studentInfos = await Promise.all(studentInfoPromises);
      
      // Actualizar emails y nombres
      studentInfos.forEach(({ studentId, email, displayName }) => {
        const activity = activityMap.get(studentId);
        if (activity) {
          activity.studentEmail = displayName || email;
        }
      });
      
      return Array.from(activityMap.values());
    } catch (error) {
      console.error('Error obteniendo actividad de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Normalizar pregunta para comparación (lowercase, trim, quitar signos de puntuación)
   */
  normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .trim()
      .replace(/[¿?¡!.,;:]/g, '') // Quitar signos de puntuación
      .replace(/\s+/g, ' ') // Normalizar espacios
      .slice(0, 200); // Limitar longitud
  },

  /**
   * Comparar si dos preguntas son similares
   */
  areQuestionsSimilar(q1: string, q2: string): boolean {
    const normalized1 = this.normalizeQuestion(q1);
    const normalized2 = this.normalizeQuestion(q2);
    
    // Si son exactamente iguales después de normalizar
    if (normalized1 === normalized2) return true;
    
    // Si una contiene a la otra (para variaciones menores)
    if (normalized1.length > 10 && normalized2.length > 10) {
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return true;
      }
    }
    
    // Calcular similitud simple (palabras en común)
    const words1 = new Set(normalized1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(normalized2.split(' ').filter(w => w.length > 2));
    
    if (words1.size === 0 || words2.size === 0) return false;
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    // Si más del 70% de las palabras coinciden, son similares
    const similarity = intersection.size / union.size;
    return similarity > 0.7;
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
      
      const questionMap = new Map<string, FrequentQuestion>();
      
      // Obtener el primer mensaje de cada conversación
      const messagePromises = conversationsSnapshot.docs.map(async (convDoc) => {
        const conv = convDoc.data();
        
        try {
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
            const questionText = firstMessage.content.trim();
            
            if (questionText) {
              return {
                questionText,
                lastAsked: (conv.lastMessageAt as Timestamp)?.toDate() || new Date(),
                askedBy: conv.userId
              };
            }
          }
        } catch (error) {
          console.error(`Error obteniendo mensajes de conversación ${convDoc.id}:`, error);
        }
        
        return null;
      });
      
      const questions = (await Promise.all(messagePromises)).filter(q => q !== null) as Array<{
        questionText: string;
        lastAsked: Date;
        askedBy: string;
      }>;
      
      // Agrupar preguntas similares
      for (const q of questions) {
        let foundSimilar = false;
        let existingKey: string | null = null;
        
        // Buscar si ya existe una pregunta similar
        for (const [key, existingQ] of questionMap.entries()) {
          if (this.areQuestionsSimilar(q.questionText, existingQ.question)) {
            // Agrupar con la pregunta existente
            existingQ.count++;
            existingQ.askedBy.push(q.askedBy);
            if (q.lastAsked > existingQ.lastAsked) {
              existingQ.lastAsked = q.lastAsked;
            }
            foundSimilar = true;
            existingKey = key;
            break;
          }
        }
        
        // Si no se encontró una similar, crear nueva entrada
        if (!foundSimilar) {
          const normalizedKey = this.normalizeQuestion(q.questionText);
          // Usar el texto original como ID único, pero normalizado como clave
          questionMap.set(normalizedKey, {
            id: `q_${Date.now()}_${Math.random()}`, // ID único
            question: q.questionText, // Mantener el texto original
            count: 1,
            lastAsked: q.lastAsked,
            askedBy: [q.askedBy]
          });
        }
      }
      
      // Ordenar por frecuencia (count) y luego por última vez preguntada
      const sortedQuestions = Array.from(questionMap.values())
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count; // Más frecuentes primero
          }
          return b.lastAsked.getTime() - a.lastAsked.getTime(); // Más recientes primero
        })
        .slice(0, 10); // Top 10
      
      return sortedQuestions;
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