import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Reminder } from '../types';

/**
 * Servicio para gestionar recordatorios y notificaciones programadas
 */
export const remindersService = {
  /**
   * Crea un nuevo recordatorio
   */
  async createReminder(
    courseId: string,
    teacherId: string,
    title: string,
    description: string,
    targetDate: Date,
    targetUsers: string[] = []
  ): Promise<string> {
    const remindersRef = collection(db, 'courses', courseId, 'reminders');
    
    const docRef = await addDoc(remindersRef, {
      courseId,
      teacherId,
      title,
      description,
      targetDate: Timestamp.fromDate(targetDate),
      targetUsers: targetUsers.length > 0 ? targetUsers : ['all'],
      createdAt: Timestamp.now(),
      sent: false,
    });

    return docRef.id;
  },

  /**
   * Obtiene todos los recordatorios de un curso
   */
  async getCourseReminders(courseId: string): Promise<Reminder[]> {
    const remindersRef = collection(db, 'courses', courseId, 'reminders');
    const remindersQuery = query(remindersRef, orderBy('targetDate', 'asc'));
    
    const snapshot = await getDocs(remindersQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        targetDate: (data.targetDate as Timestamp)?.toDate() || new Date(),
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        sentAt: data.sentAt ? (data.sentAt as Timestamp)?.toDate() : undefined,
      } as Reminder;
    });
  },

  /**
   * Obtiene los recordatorios pendientes para un estudiante
   */
  async getStudentReminders(courseId: string, studentId: string): Promise<Reminder[]> {
    const remindersRef = collection(db, 'courses', courseId, 'reminders');
    const remindersQuery = query(
      remindersRef,
      where('sent', '==', false),
      orderBy('targetDate', 'asc')
    );
    
    const snapshot = await getDocs(remindersQuery);
    const now = new Date();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          targetDate: (data.targetDate as Timestamp)?.toDate() || new Date(),
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Reminder;
      })
      .filter(reminder => {
        // Filtrar por usuario (si es 'all' o incluye al estudiante)
        const isForStudent = reminder.targetUsers.includes('all') || 
                            reminder.targetUsers.includes(studentId);
        // Solo mostrar recordatorios futuros o del día actual
        return isForStudent && reminder.targetDate >= now;
      });
  },

  /**
   * Marca un recordatorio como enviado
   */
  async markAsSent(courseId: string, reminderId: string): Promise<void> {
    const reminderRef = doc(db, 'courses', courseId, 'reminders', reminderId);
    await updateDoc(reminderRef, {
      sent: true,
      sentAt: Timestamp.now(),
    });
  },

  /**
   * Elimina un recordatorio
   */
  async deleteReminder(courseId: string, reminderId: string): Promise<void> {
    const reminderRef = doc(db, 'courses', courseId, 'reminders', reminderId);
    await deleteDoc(reminderRef);
  }
};

