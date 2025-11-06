import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';

interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: Date;
}

export const coursesService = {
  async createCourse(
    name: string, 
    description: string, 
    teacherId: string, 
    teacherName: string
  ): Promise<Course> {
    const docRef = await addDoc(collection(db, 'courses'), {
      name,
      description,
      teacherId,
      teacherName,
      createdAt: Timestamp.now()
    });
    
    return { 
      id: docRef.id, 
      name, 
      description, 
      teacherId, 
      teacherName, 
      createdAt: new Date() 
    };
  },

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const q = query(
      collection(db, 'courses'), 
      where('teacherId', '==', teacherId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Course[];
  },

  async getAllCourses(): Promise<Course[]> {
    const snapshot = await getDocs(collection(db, 'courses'));
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Course[];
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date()
    } as Course;
  }
};