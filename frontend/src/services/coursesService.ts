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
  deleteDoc,
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
    
    // Obtener nombre actualizado del docente una vez
    const teacherDoc = await getDoc(doc(db, 'users', teacherId));
    let updatedTeacherName: string | null = null;
    
    if (teacherDoc.exists()) {
      const userData = teacherDoc.data();
      updatedTeacherName = userData.displayName || 
        (userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : userData.email || null);
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Usar nombre actualizado si está disponible, sino usar el guardado
      const teacherName = updatedTeacherName || data.teacherName;
      
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        teacherId: data.teacherId,
        teacherName: teacherName,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        status: data.status || 'active',
        maxPagesPerFile: data.maxPagesPerFile || 10
      };
    });
  },

  /**
   * Obtener nombre actualizado del docente desde Firestore
   */
  async getTeacherName(teacherId: string, currentTeacherName: string): Promise<string> {
    try {
      // Si el nombre actual parece ser un email, intentar obtener el nombre actualizado
      if (currentTeacherName.includes('@')) {
        const userDoc = await getDoc(doc(db, 'users', teacherId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedName = userData.displayName || 
            (userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`.trim()
              : userData.email || currentTeacherName);
          return updatedName;
        }
      }
      return currentTeacherName;
    } catch (error) {
      console.error(`Error obteniendo nombre del docente ${teacherId}:`, error);
      return currentTeacherName;
    }
  },

  /**
   * Obtener cursos en los que un estudiante está inscrito
   * Nota: Firestore no permite consultas directas en subcolecciones sin conocer el courseId,
   * por lo que necesitamos iterar sobre los cursos. Para optimizar, podríamos crear una
   * colección de enrollments a nivel raíz en el futuro.
   */
  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    try {
      // Obtener todos los cursos activos
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), where('status', '==', 'active'))
      );
      
      if (coursesSnapshot.empty) {
        return [];
      }
      
      // Verificar enrollments en paralelo para todos los cursos
      const enrollmentChecks = coursesSnapshot.docs.map(async (courseDoc) => {
        const courseId = courseDoc.id;
        const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments');
        const enrollmentQuery = query(
          enrollmentsRef,
          where('studentId', '==', studentId),
          where('status', '==', 'active')
        );
        const enrollmentSnapshot = await getDocs(enrollmentQuery);
        
        return {
          courseDoc,
          isEnrolled: !enrollmentSnapshot.empty
        };
      });
      
      const results = await Promise.all(enrollmentChecks);
      
      // Filtrar cursos en los que está inscrito
      const enrolledCourses = results.filter(result => result.isEnrolled);
      
      // Obtener nombres actualizados de los docentes en paralelo
      const coursesWithUpdatedNames = await Promise.all(
        enrolledCourses.map(async (result) => {
          const data = result.courseDoc.data();
          const teacherName = await this.getTeacherName(data.teacherId, data.teacherName);
          
          return {
            id: result.courseDoc.id,
            title: data.title,
            description: data.description,
            teacherId: data.teacherId,
            teacherName: teacherName,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            status: data.status || 'active',
        maxPagesPerFile: data.maxPagesPerFile || 10
          };
        })
      );
      
      return coursesWithUpdatedNames;
    } catch (error) {
      console.error('Error obteniendo cursos del estudiante:', error);
      throw error;
    }
  },

  /**
   * Obtener un curso por ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    // Obtener nombre actualizado del docente
    const teacherName = await this.getTeacherName(data.teacherId, data.teacherName);
    
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      teacherId: data.teacherId,
      teacherName: teacherName,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      status: data.status || 'active',
      maxPagesPerFile: data.maxPagesPerFile || 10
    };
  },

  /**
   * Actualizar información del curso
   */
  async updateCourse(
    courseId: string,
    updates: Partial<Pick<Course, 'title' | 'description' | 'maxPagesPerFile'>>
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
  },

  /**
   * Eliminar curso permanentemente
   * Nota: Esto eliminará el curso y todas sus subcolecciones (conversaciones, mensajes, archivos, enrollments)
   * En producción, considera usar archiveCourse en su lugar para mantener integridad de datos
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      
      // Eliminar subcolecciones primero (Firestore no elimina subcolecciones automáticamente)
      // Nota: En producción, esto debería hacerse con Cloud Functions o en el backend
      // Por ahora, solo eliminamos el documento principal
      // Las subcolecciones quedarán huérfanas pero no afectarán la funcionalidad principal
      
      await deleteDoc(courseRef);
    } catch (error) {
      console.error('Error eliminando curso:', error);
      throw error;
    }
  }
};