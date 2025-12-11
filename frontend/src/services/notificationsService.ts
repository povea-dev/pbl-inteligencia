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
  type: 'file_uploaded' | 'course_updated' | 'message' | 'student_enrolled';
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
        const promises = notifications.map(async (notif) => {
          const docRef = await addDoc(notificationsRef, notif);
          console.log(`[notificationsService] ✅ Notificación de archivo creada:`, {
            id: docRef.id,
            userId: notif.userId,
            courseId: courseId,
            fileName: fileName
          });
          return docRef;
        });
        await Promise.all(promises);
        console.log(`[notificationsService] ✅ Total de notificaciones de archivo creadas: ${notifications.length}`);
      } else {
        console.warn(`[notificationsService] ⚠️ No hay estudiantes inscritos para notificar sobre el archivo`);
      }
    } catch (error) {
      console.error('Error creando notificaciones:', error);
      throw error;
    }
  },

  /**
   * Crear notificación cuando un estudiante es agregado a un curso
   */
  async notifyStudentEnrolled(
    courseId: string,
    courseTitle: string,
    studentId: string,
    teacherName: string
  ): Promise<void> {
    try {
      console.log(`[notificationsService] Creando notificación de inscripción para estudiante:`, {
        courseId,
        courseTitle,
        studentId,
        teacherName
      });

      // Obtener información del curso para el mensaje
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseName = courseDoc.exists() ? courseDoc.data().title : courseTitle;

      // Crear la notificación
      const notification = {
        userId: studentId,
        courseId,
        type: 'student_enrolled' as const,
        title: 'Has sido agregado a un curso',
        message: `${teacherName} te ha agregado al curso "${courseName}"`,
        relatedId: courseId,
        createdAt: serverTimestamp(),
        read: false
      };

      // Guardar la notificación
      const notificationsRef = collection(db, 'notifications');
      const notificationDoc = await addDoc(notificationsRef, notification);
      
      console.log(`[notificationsService] ✅ Notificación de inscripción creada:`, {
        id: notificationDoc.id,
        studentId: studentId,
        courseId: courseId,
        courseName: courseName,
        teacherName: teacherName
      });
    } catch (error) {
      console.error('[notificationsService] Error creando notificación de inscripción:', error);
      // No lanzar el error para que no falle la inscripción si la notificación falla
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
    console.log(`[notificationsService] Suscribiéndose a notificaciones en tiempo real para userId: ${userId}`);
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q, 
      (snapshot) => {
        console.log(`[notificationsService] 📬 Notificaciones recibidas en tiempo real:`, {
          cantidad: snapshot.size,
          userId: userId
        });
        
        const notifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            courseId: data.courseId,
            type: data.type,
            title: data.title,
            message: data.message,
            relatedId: data.relatedId,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            read: data.read || false
          };
        });
        
        // Ordenar: no leídas primero, luego por fecha
        const sortedNotifications = notifications.sort((a, b) => {
          if (a.read !== b.read) {
            return a.read ? 1 : -1; // No leídas primero
          }
          return b.createdAt.getTime() - a.createdAt.getTime(); // Más recientes primero
        });
        
        console.log(`[notificationsService] Notificaciones ordenadas:`, {
          total: sortedNotifications.length,
          noLeidas: sortedNotifications.filter(n => !n.read).length
        });
        
        callback(sortedNotifications);
      },
      (error) => {
        console.error(`[notificationsService] ❌ Error en suscripción en tiempo real:`, error);
        // Si hay un error de índice, intentar sin orderBy
        if (error.code === 'failed-precondition') {
          console.warn(`[notificationsService] ⚠️ Error de índice. Intentando sin orderBy...`);
          const qWithoutOrder = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
          );
          
          return onSnapshot(qWithoutOrder, (snapshot) => {
            const notifications = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                userId: data.userId,
                courseId: data.courseId,
                type: data.type,
                title: data.title,
                message: data.message,
                relatedId: data.relatedId,
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                read: data.read || false
              };
            });
            
            // Ordenar manualmente
            const sortedNotifications = notifications.sort((a, b) => {
              if (a.read !== b.read) {
                return a.read ? 1 : -1;
              }
              return b.createdAt.getTime() - a.createdAt.getTime();
            });
            
            callback(sortedNotifications);
          });
        }
      }
    );
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

