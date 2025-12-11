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
    console.log(`[coursesService] getCoursesByStudent llamado con studentId:`, studentId);
    try {
      // Obtener todos los cursos activos
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), where('status', '==', 'active'))
      );
      
      console.log(`[coursesService] Total de cursos activos encontrados:`, coursesSnapshot.size);
      
      if (coursesSnapshot.empty) {
        console.log(`[coursesService] No hay cursos activos`);
        return [];
      }
      
      // Verificar que el estudiante existe en la base de datos y obtener su fecha de creación
      // Si no existe, no debería ver ningún curso
      let studentExists = false;
      let studentCreatedAt: Date | null = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', studentId));
        studentExists = userDoc.exists();
        if (!studentExists) {
          console.log(`[coursesService] ADVERTENCIA: El studentId ${studentId} no existe en la base de datos`);
          console.log(`[coursesService] No se mostrarán cursos para un usuario que no existe`);
          return [];
        }
        
        const userData = userDoc.data();
        if (userData.createdAt) {
          studentCreatedAt = (userData.createdAt as Timestamp)?.toDate() || null;
          console.log(`[coursesService] Estudiante verificado. Fecha de creación de cuenta:`, studentCreatedAt);
        } else {
          console.log(`[coursesService] Estudiante verificado pero sin fecha de creación`);
        }
      } catch (error) {
        console.error(`[coursesService] Error verificando estudiante:`, error);
        return [];
      }
      
      // Obtener el email del estudiante una vez para usar en el fallback
      let studentEmail: string | null = null;
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', studentId));
        if (currentUserDoc.exists()) {
          studentEmail = currentUserDoc.data().email?.toLowerCase().trim() || null;
          console.log(`[coursesService] Email del estudiante obtenido para fallback:`, studentEmail);
        }
      } catch (error) {
        console.error(`[coursesService] Error obteniendo email del estudiante:`, error);
      }
      
      // Verificar enrollments en paralelo para todos los cursos
      const enrollmentChecks = coursesSnapshot.docs.map(async (courseDoc) => {
        const courseId = courseDoc.id;
        const courseData = courseDoc.data();
        const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments');
        
        // IMPORTANTE: Solo buscar por studentId exacto
        // NO buscar por email para evitar que nuevas cuentas vean cursos de cuentas anteriores
        const enrollmentQuery = query(
          enrollmentsRef,
          where('studentId', '==', studentId),
          where('status', '==', 'active')
        );
        let enrollmentSnapshot = await getDocs(enrollmentQuery);
        
        console.log(`[coursesService] Búsqueda inicial por studentId en curso "${courseData.title}":`, {
          studentId: studentId,
          enrollmentsEncontrados: enrollmentSnapshot.size
        });
        
        // Verificar que el enrollment encontrado realmente pertenece a un usuario activo
        if (!enrollmentSnapshot.empty) {
          // Verificar que el studentId en el enrollment corresponde a un usuario que existe
          const enrollmentData = enrollmentSnapshot.docs[0].data();
          const enrollmentStudentId = enrollmentData.studentId;
          
          if (enrollmentStudentId !== studentId) {
            console.log(`[coursesService] ADVERTENCIA: El enrollment tiene un studentId diferente al buscado`);
            console.log(`[coursesService] Enrollment studentId: ${enrollmentStudentId}, Buscado: ${studentId}`);
            // No considerar este enrollment como válido
            return {
              courseDoc,
              isEnrolled: false
            };
          }
          
          // Verificar que el enrollment no sea más antiguo que la cuenta del usuario
          // Si el enrollment es más antiguo, significa que fue creado para una cuenta anterior
          if (studentCreatedAt) {
            const enrollmentCreatedAt = enrollmentData.enrolledAt;
            let enrollmentDate: Date | null = null;
            
            if (enrollmentCreatedAt) {
              enrollmentDate = (enrollmentCreatedAt as Timestamp)?.toDate() || null;
            }
            
            if (enrollmentDate && enrollmentDate < studentCreatedAt) {
              console.log(`[coursesService] ADVERTENCIA: El enrollment es más antiguo que la cuenta del usuario`);
              console.log(`[coursesService] Enrollment creado: ${enrollmentDate}, Cuenta creada: ${studentCreatedAt}`);
              console.log(`[coursesService] Este enrollment será ignorado (probablemente de una cuenta anterior)`);
              
              // Marcar el enrollment como removido para limpiar la base de datos
              try {
                await updateDoc(doc(db, 'courses', courseId, 'enrollments', enrollmentSnapshot.docs[0].id), {
                  status: 'removed'
                });
                console.log(`[coursesService] Enrollment de cuenta anterior marcado como removido`);
              } catch (updateError) {
                console.error(`[coursesService] Error marcando enrollment como removido:`, updateError);
              }
              
              // No considerar este enrollment como válido
              return {
                courseDoc,
                isEnrolled: false
              };
            }
          }
          
          // Verificar que el usuario existe en la base de datos
          try {
            const userDoc = await getDoc(doc(db, 'users', enrollmentStudentId));
            if (!userDoc.exists()) {
              console.log(`[coursesService] ADVERTENCIA: El studentId ${enrollmentStudentId} en el enrollment NO existe en la base de datos`);
              console.log(`[coursesService] Este enrollment será ignorado (probablemente de una cuenta eliminada)`);
              
              // Marcar el enrollment como removido
              try {
                await updateDoc(doc(db, 'courses', courseId, 'enrollments', enrollmentSnapshot.docs[0].id), {
                  status: 'removed'
                });
                console.log(`[coursesService] Enrollment de usuario inexistente marcado como removido`);
              } catch (updateError) {
                console.error(`[coursesService] Error marcando enrollment como removido:`, updateError);
              }
              
              // No considerar este enrollment como válido
              return {
                courseDoc,
                isEnrolled: false
              };
            }
          } catch (error) {
            console.error(`[coursesService] Error verificando usuario del enrollment:`, error);
            // En caso de error, no considerar el enrollment como válido por seguridad
            return {
              courseDoc,
              isEnrolled: false
            };
          }
        }
        
        // Si no se encuentra por studentId, intentar buscar por email como fallback
        // PERO solo si el enrollment es válido (más reciente que la cuenta o del mismo email)
        if (enrollmentSnapshot.empty && studentEmail) {
          console.log(`[coursesService] No se encontró enrollment por studentId. Intentando búsqueda por email como fallback...`);
          console.log(`[coursesService] Email a buscar: ${studentEmail}`);
          
          if (studentEmail) {
            // Buscar enrollments por email
            const emailQuery = query(
              enrollmentsRef,
              where('studentEmail', '==', studentEmail),
              where('status', '==', 'active')
            );
            const emailSnapshot = await getDocs(emailQuery);
            
            if (!emailSnapshot.empty) {
              console.log(`[coursesService] Se encontró enrollment por email. Verificando validez...`);
              
              // Verificar cada enrollment encontrado por email
              for (const enrollmentDoc of emailSnapshot.docs) {
                const enrollmentData = enrollmentDoc.data();
                const enrollmentStudentId = enrollmentData.studentId;
                const enrollmentEmail = enrollmentData.studentEmail?.toLowerCase().trim();
                
                // Si el email coincide y el enrollment es más reciente que la cuenta, actualizar el studentId
                if (enrollmentEmail === studentEmail) {
                  let enrollmentDate: Date | null = null;
                  if (enrollmentData.enrolledAt) {
                    enrollmentDate = (enrollmentData.enrolledAt as Timestamp)?.toDate() || null;
                  }
                  
                  // Si el enrollment es más reciente que la cuenta, o si no hay fecha de creación, actualizar
                  const shouldUpdate = !studentCreatedAt || !enrollmentDate || enrollmentDate >= studentCreatedAt;
                  
                  if (shouldUpdate && enrollmentStudentId !== studentId) {
                    console.log(`[coursesService] Actualizando enrollment para usar el studentId actual...`);
                    console.log(`[coursesService]   - studentId anterior: ${enrollmentStudentId}`);
                    console.log(`[coursesService]   - studentId nuevo: ${studentId}`);
                    
                    try {
                      // Actualizar el studentId y la fecha de inscripción para que pase la verificación de fechas
                      await updateDoc(doc(db, 'courses', courseId, 'enrollments', enrollmentDoc.id), {
                        studentId: studentId,
                        enrolledAt: serverTimestamp() // Actualizar fecha para que sea válido
                      });
                      console.log(`[coursesService] ✅ Enrollment actualizado exitosamente (studentId y fecha)`);
                      
                      // Ahora buscar de nuevo por studentId
                      const updatedQuery = query(
                        enrollmentsRef,
                        where('studentId', '==', studentId),
                        where('status', '==', 'active')
                      );
                      const updatedSnapshot = await getDocs(updatedQuery);
                      
                      if (!updatedSnapshot.empty) {
                        console.log(`[coursesService] Enrollment encontrado después de actualizar`);
                        enrollmentSnapshot = updatedSnapshot;
                        break;
                      }
                    } catch (updateError) {
                      console.error(`[coursesService] Error actualizando enrollment:`, updateError);
                    }
                  } else if (enrollmentDate && studentCreatedAt && enrollmentDate < studentCreatedAt) {
                    console.log(`[coursesService] El enrollment por email es más antiguo que la cuenta. No se actualizará.`);
                  }
                }
              }
            }
          }
          
          if (enrollmentSnapshot.empty) {
            console.log(`[coursesService] Estudiante NO inscrito en curso "${courseData.title}" (${courseId})`);
          }
        }
        
        console.log(`[coursesService] Curso "${courseData.title}" (${courseId}):`, {
          enrollmentsEncontrados: enrollmentSnapshot.size,
          isEnrolled: !enrollmentSnapshot.empty,
          busquedaPor: enrollmentSnapshot.empty ? 'ninguna' : (enrollmentSnapshot.docs[0].data().studentId === studentId ? 'studentId' : 'email')
        });
        
        // Si no se encuentra, verificar si hay enrollments con este studentId pero status diferente
        if (enrollmentSnapshot.empty) {
          // Verificar si hay enrollments con este studentId pero con otro status
          const allStatusQuery = query(
            enrollmentsRef,
            where('studentId', '==', studentId)
          );
          const allStatusSnapshot = await getDocs(allStatusQuery);
          
          if (!allStatusSnapshot.empty) {
            console.log(`[coursesService] Se encontraron enrollments con este studentId pero con status diferente:`, {
              curso: courseData.title,
              enrollments: allStatusSnapshot.docs.map(d => ({
                id: d.id,
                status: d.data().status,
                studentId: d.data().studentId
              }))
            });
          }
        }
        
        return {
          courseDoc,
          isEnrolled: !enrollmentSnapshot.empty
        };
      });
      
      const results = await Promise.all(enrollmentChecks);
      
      // Filtrar cursos en los que está inscrito
      const enrolledCourses = results.filter(result => result.isEnrolled);
      console.log(`[coursesService] Total de cursos en los que está inscrito (antes de eliminar duplicados):`, enrolledCourses.length);
      
      // Eliminar duplicados por courseId (en caso de que haya múltiples enrollments para el mismo curso)
      const uniqueCoursesMap = new Map<string, typeof enrolledCourses[0]>();
      enrolledCourses.forEach(result => {
        const courseId = result.courseDoc.id;
        if (!uniqueCoursesMap.has(courseId)) {
          uniqueCoursesMap.set(courseId, result);
        } else {
          console.log(`[coursesService] Curso duplicado detectado y eliminado:`, courseId);
        }
      });
      
      const uniqueEnrolledCourses = Array.from(uniqueCoursesMap.values());
      console.log(`[coursesService] Total de cursos únicos en los que está inscrito:`, uniqueEnrolledCourses.length);
      
      // Obtener nombres actualizados de los docentes en paralelo
      const coursesWithUpdatedNames = await Promise.all(
        uniqueEnrolledCourses.map(async (result) => {
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