import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, UserRole } from '../types';

export const conversationsService = {
  /**
   * Crear una nueva conversación
   */
  async createConversation(
    courseId: string,
    userId: string,
    userRole: UserRole,
    initialMessage: string
  ): Promise<string> {
    try {
      // Generar título automático (primeras palabras del mensaje)
      const title = initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : '');
      
      const conversationRef = await addDoc(
        collection(db, 'courses', courseId, 'conversations'),
        {
          userId,
          userRole,
          title,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          messageCount: 0,
          status: 'active'
        }
      );
      
      return conversationRef.id;
    } catch (error) {
      console.error('Error creando conversación:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las conversaciones de un usuario en un curso
   */
  async getUserConversations(
    courseId: string,
    userId: string
  ): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'courses', courseId, 'conversations'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('lastMessageAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        courseId,
        userId: doc.data().userId,
        userRole: doc.data().userRole,
        title: doc.data().title,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        lastMessageAt: (doc.data().lastMessageAt as Timestamp)?.toDate() || new Date(),
        messageCount: doc.data().messageCount || 0,
        status: doc.data().status
      }));
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las conversaciones de un curso (para el docente)
   */
  async getAllCourseConversations(courseId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'courses', courseId, 'conversations'),
        orderBy('lastMessageAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        courseId,
        userId: doc.data().userId,
        userRole: doc.data().userRole,
        title: doc.data().title,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        lastMessageAt: (doc.data().lastMessageAt as Timestamp)?.toDate() || new Date(),
        messageCount: doc.data().messageCount || 0,
        status: doc.data().status
      }));
    } catch (error) {
      console.error('Error obteniendo todas las conversaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener una conversación por ID
   */
  async getConversationById(
    courseId: string,
    conversationId: string
  ): Promise<Conversation | null> {
    try {
      const docRef = doc(db, 'courses', courseId, 'conversations', conversationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        courseId,
        userId: data.userId,
        userRole: data.userRole,
        title: data.title,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() || new Date(),
        messageCount: data.messageCount || 0,
        status: data.status
      };
    } catch (error) {
      console.error('Error obteniendo conversación:', error);
      return null;
    }
  },

  /**
   * Actualizar última actividad de una conversación
   */
  async updateLastActivity(
    courseId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error actualizando actividad:', error);
    }
  },

  /**
   * Incrementar contador de mensajes
   */
  async incrementMessageCount(
    courseId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (conversationSnap.exists()) {
        const currentCount = conversationSnap.data().messageCount || 0;
        await updateDoc(conversationRef, {
          messageCount: currentCount + 1
        });
      }
    } catch (error) {
      console.error('Error incrementando contador:', error);
    }
  },

  /**
   * Eliminar una conversación (y todos sus mensajes)
   */
  async deleteConversation(
    courseId: string,
    conversationId: string
  ): Promise<void> {
    try {
      // Primero eliminar todos los mensajes
      const messagesQuery = query(
        collection(db, 'courses', courseId, 'conversations', conversationId, 'messages')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(msgDoc => 
        deleteDoc(msgDoc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Luego eliminar la conversación
      const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
      await deleteDoc(conversationRef);
      
    } catch (error) {
      console.error('Error eliminando conversación:', error);
      throw error;
    }
  },

  /**
   * Eliminar conversaciones antiguas (> 30 días)
   */
  async deleteOldConversations(courseId: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db, 'courses', courseId, 'conversations'),
        where('lastMessageAt', '<', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => 
        this.deleteConversation(courseId, doc.id)
      );
      
      await Promise.all(deletePromises);
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error eliminando conversaciones antiguas:', error);
      throw error;
    }
  },

  /**
   * Archivar conversación (en lugar de eliminar)
   */
  async archiveConversation(
    courseId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        status: 'archived'
      });
    } catch (error) {
      console.error('Error archivando conversación:', error);
      throw error;
    }
  }
};