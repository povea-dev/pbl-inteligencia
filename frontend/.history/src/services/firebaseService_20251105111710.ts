import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, ChatSession, Problem } from '../types';

export const firebaseService = {
  // ========== SESIONES ==========
  
  async createSession(studentId: string, problemId: string): Promise<string> {
    try {
      const sessionRef = await addDoc(collection(db, 'sessions'), {
        studentId,
        problemId,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        status: 'active'
      });
      return sessionRef.id;
    } catch (error) {
      console.error('Error creando sesión:', error);
      throw error;
    }
  },

  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error actualizando actividad:', error);
    }
  },

  async completeSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'completed',
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error completando sesión:', error);
      throw error;
    }
  },

  // ========== MENSAJES ==========
  
  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    try {
      const messageRef = await addDoc(collection(db, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
      return messageRef.id;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      throw error;
    }
  },

  subscribeToMessages(
    sessionId: string, 
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sessionId: data.sessionId,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date(),
          metadata: data.metadata
        } as Message;
      });
      
      callback(messages);
    }, (error) => {
      console.error('Error en suscripción de mensajes:', error);
    });

    return unsubscribe;
  },

  // ========== PROBLEMAS ==========
  
  async getProblems(): Promise<Problem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'problems'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Problem[];
    } catch (error) {
      console.error('Error obteniendo problemas:', error);
      throw error;
    }
  },

  async getProblemById(problemId: string): Promise<Problem | null> {
    try {
      const problems = await this.getProblems();
      return problems.find(p => p.id === problemId) || null;
    } catch (error) {
      console.error('Error obteniendo problema:', error);
      return null;
    }
  }
};