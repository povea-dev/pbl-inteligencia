import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

export interface Student {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  enrolledAt: Date;
}

export const studentsService = {
  /**
   * Buscar usuario por correo electrónico
   */
  async findUserByEmail(email: string): Promise<{ uid: string; email: string; firstName?: string; lastName?: string; displayName?: string; role: string } | null> {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase().trim())
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        uid: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        role: userData.role
      };
    } catch (error) {
      console.error('Error buscando usuario por correo:', error);
      throw error;
    }
  },

  /**
   * Agregar estudiante a un curso
   */
  async addStudentToCourse(courseId: string, studentEmail: string): Promise<void> {
    try {
      // Buscar el usuario por correo
      const user = await this.findUserByEmail(studentEmail);
      
      if (!user) {
        throw new Error('No se encontró un usuario con ese correo electrónico');
      }
      
      if (user.role !== 'student') {
        throw new Error('El usuario no es un estudiante');
      }
      
      // Verificar si ya está inscrito
      const enrollmentRef = collection(db, 'courses', courseId, 'enrollments');
      const existingQuery = query(
        enrollmentRef,
        where('studentId', '==', user.uid)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('El estudiante ya está inscrito en este curso');
      }
      
      // Agregar inscripción
      await addDoc(enrollmentRef, {
        studentId: user.uid,
        studentEmail: user.email,
        studentName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        enrolledAt: serverTimestamp(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error agregando estudiante al curso:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los estudiantes de un curso
   */
  async getCourseStudents(courseId: string): Promise<Student[]> {
    try {
      const enrollmentRef = collection(db, 'courses', courseId, 'enrollments');
      const q = query(enrollmentRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.studentEmail,
          firstName: data.studentName?.split(' ')[0],
          lastName: data.studentName?.split(' ').slice(1).join(' '),
          displayName: data.studentName,
          enrolledAt: (data.enrolledAt as Timestamp)?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error obteniendo estudiantes del curso:', error);
      throw error;
    }
  },

  /**
   * Remover estudiante de un curso
   */
  async removeStudentFromCourse(courseId: string, enrollmentId: string): Promise<void> {
    try {
      const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', enrollmentId);
      await updateDoc(enrollmentRef, {
        status: 'removed'
      });
    } catch (error) {
      console.error('Error removiendo estudiante del curso:', error);
      throw error;
    }
  }
};

