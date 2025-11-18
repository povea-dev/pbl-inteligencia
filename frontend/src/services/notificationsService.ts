import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
  id: string;
  userId: string;
  courseId: string;
  type: 'file_uploaded' | 'course_updated' | 'message';
  title: string;
  message: string;
  relatedId?: string; // ID del archivo, curso, etc.
  createdAt: Date;
  read: boolean;
}

export const notificationsService = {
  /**
   * Crear notificación para estudiantes cuando se sube un archivo
   */
  async notifyFileUploaded(
    courseId: string,
    fileName: string,
    fileId: string,
    teacherName: string
  ): Promise<void> {
    try {
      // Obtener todos los estudiantes inscritos en el curso
      const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments');
      const enrollmentsQuery = query(
        enrollmentsRef,
        where('status', '==', 'active')
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      // Crear notificación para cada estudiante
      const notifications = enrollmentsSnapshot.docs.map(enrollment => {
        const enrollmentData = enrollment.data();
        return {
          userId: enrollmentData.studentId,
          courseId,
          type: 'file_uploaded' as const,
          title: 'Nuevo archivo disponible',
          message: `${teacherName} ha subido un nuevo archivo: ${fileName}`,
          relatedId: fileId,
          createdAt: serverTimestamp(),
          read: false
        };
      });
      
      // Guardar todas las notificaciones
      if (notifications.length > 0) {
        const notificationsRef = collection(db, 'notifications');
        const promises = notifications.map(notif => addDoc(notificationsRef, notif));
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error creando notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener notificaciones de un usuario
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      // Ordenar por read después de obtener (porque Firestore no permite múltiples orderBy sin índice compuesto)
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        courseId: doc.data().courseId,
        type: doc.data().type,
        title: doc.data().title,
        message: doc.data().message,
        relatedId: doc.data().relatedId,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        read: doc.data().read || false
      }));
      
      // Ordenar: no leídas primero, luego por fecha
      return notifications.sort((a, b) => {
        if (a.read !== b.read) {
          return a.read ? 1 : -1; // No leídas primero
        }
        return b.createdAt.getTime() - a.createdAt.getTime(); // Más recientes primero
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  /**
   * Suscribirse a notificaciones en tiempo real
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        courseId: doc.data().courseId,
        type: doc.data().type,
        title: doc.data().title,
        message: doc.data().message,
        relatedId: doc.data().relatedId,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        read: doc.data().read || false
      }));
      
      callback(notifications);
    });
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      
      const promises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error obteniendo cantidad de notificaciones no leídas:', error);
      return 0;
    }
  }
};

