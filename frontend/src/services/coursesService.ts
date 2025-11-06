import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  Timestamp,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Course } from '../types';

export const coursesService = {
  /**
   * Crear un curso
   */
  async createCourse(
    title: string, 
    description: string, 
    teacherId: string, 
    teacherName: string
  ): Promise<Course> {
    const docRef = await addDoc(collection(db, 'courses'), {
      title,
      description,
      teacherId,
      teacherName,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    
    return { 
      id: docRef.id, 
      title, 
      description, 
      teacherId, 
      teacherName, 
      createdAt: new Date(),
      status: 'active'
    };
  },

  /**
   * Obtener cursos de un docente
   */
  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const q = query(
      collection(db, 'courses'), 
      where('teacherId', '==', teacherId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      teacherId: doc.data().teacherId,
      teacherName: doc.data().teacherName,
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      status: doc.data().status || 'active'
    }));
  },

  /**
   * Obtener todos los cursos activos
   */
  async getAllCourses(): Promise<Course[]> {
    const q = query(
      collection(db, 'courses'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      teacherId: doc.data().teacherId,
      teacherName: doc.data().teacherName,
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      status: doc.data().status || 'active'
    }));
  },

  /**
   * Obtener un curso por ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      title: docSnap.data().title,
      description: docSnap.data().description,
      teacherId: docSnap.data().teacherId,
      teacherName: docSnap.data().teacherName,
      createdAt: (docSnap.data().createdAt as Timestamp)?.toDate() || new Date(),
      status: docSnap.data().status || 'active'
    };
  },

  /**
   * Actualizar información del curso
   */
  async updateCourse(
    courseId: string,
    updates: Partial<Pick<Course, 'title' | 'description'>>
  ): Promise<void> {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, updates);
  },

  /**
   * Archivar curso
   */
  async archiveCourse(courseId: string): Promise<void> {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      status: 'archived'
    });
  }
};