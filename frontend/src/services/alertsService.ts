import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MisuseAlert {
  id: string;
  courseId: string;
  conversationId: string;
  studentId: string;
  studentEmail?: string;
  studentMessage: string;
  reason: string;
  detectedAt: Date;
  viewed: boolean;
  teacherId: string;
}

export const alertsService = {
  /**
   * Crear una alerta de mal uso de IA
   */
  async createMisuseAlert(
    courseId: string,
    conversationId: string,
    studentId: string,
    studentMessage: string,
    reason: string,
    teacherId: string
  ): Promise<string> {
    try {
      const alertRef = await addDoc(
        collection(db, 'courses', courseId, 'misuseAlerts'),
        {
          conversationId,
          studentId,
          studentMessage,
          reason,
          teacherId,
          detectedAt: serverTimestamp(),
          viewed: false
        }
      );
      
      return alertRef.id;
    } catch (error) {
      console.error('Error creando alerta de mal uso:', error);
      throw error;
    }
  },

  /**
   * Obtener alertas de mal uso para un curso
   */
  async getMisuseAlerts(courseId: string, teacherId: string): Promise<MisuseAlert[]> {
    try {
      const q = query(
        collection(db, 'courses', courseId, 'misuseAlerts'),
        where('teacherId', '==', teacherId),
        orderBy('detectedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        courseId,
        conversationId: doc.data().conversationId,
        studentId: doc.data().studentId,
        studentEmail: doc.data().studentEmail,
        studentMessage: doc.data().studentMessage,
        reason: doc.data().reason,
        detectedAt: (doc.data().detectedAt as Timestamp)?.toDate() || new Date(),
        viewed: doc.data().viewed || false,
        teacherId: doc.data().teacherId
      }));
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  /**
   * Suscribirse a alertas en tiempo real
   */
  subscribeToAlerts(
    courseId: string,
    teacherId: string,
    callback: (alerts: MisuseAlert[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'courses', courseId, 'misuseAlerts'),
      where('teacherId', '==', teacherId),
      orderBy('detectedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        courseId,
        conversationId: doc.data().conversationId,
        studentId: doc.data().studentId,
        studentEmail: doc.data().studentEmail,
        studentMessage: doc.data().studentMessage,
        reason: doc.data().reason,
        detectedAt: (doc.data().detectedAt as Timestamp)?.toDate() || new Date(),
        viewed: doc.data().viewed || false,
        teacherId: doc.data().teacherId
      }));
      
      callback(alerts);
    });
  },

  /**
   * Marcar alerta como vista
   */
  async markAsViewed(courseId: string, alertId: string): Promise<void> {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'courses', courseId, 'misuseAlerts', alertId), {
        viewed: true
      });
    } catch (error) {
      console.error('Error marcando alerta como vista:', error);
      throw error;
    }
  }
};

