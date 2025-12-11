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
import { notificationsService } from './notificationsService';

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
   * Normaliza el email para buscar (minúsculas, sin espacios)
   */
  async findUserByEmail(email: string): Promise<{ uid: string; email: string; firstName?: string; lastName?: string; displayName?: string; role: string } | null> {
    console.log(`[studentsService] findUserByEmail llamado con:`, email);
    try {
      // Normalizar el email de búsqueda
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`[studentsService] Email normalizado:`, normalizedEmail);
      
      // Intentar buscar con el email normalizado
      let q = query(
        collection(db, 'users'),
        where('email', '==', normalizedEmail)
      );
      
      console.log(`[studentsService] Buscando usuario con email normalizado...`);
      let snapshot = await getDocs(q);
      console.log(`[studentsService] Resultado búsqueda normalizada:`, snapshot.size, 'usuarios encontrados');
      
      // Si no se encuentra, intentar buscar sin normalizar (por si el email se guardó con mayúsculas)
      if (snapshot.empty) {
        console.log(`[studentsService] No se encontró con email normalizado, intentando sin normalizar...`);
        q = query(
          collection(db, 'users'),
          where('email', '==', email.trim())
        );
        snapshot = await getDocs(q);
        console.log(`[studentsService] Resultado búsqueda sin normalizar:`, snapshot.size, 'usuarios encontrados');
      }
      
      // Si aún no se encuentra, buscar manualmente en todos los usuarios (fallback)
      if (snapshot.empty) {
        console.log(`[studentsService] No se encontró con ninguna búsqueda, usando fallback manual...`);
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`[studentsService] Total de usuarios en la BD:`, allUsersSnapshot.size);
        const matchingUser = allUsersSnapshot.docs.find(doc => {
          const userEmail = doc.data().email;
          if (!userEmail) return false;
          return userEmail.toLowerCase().trim() === normalizedEmail;
        });
        
        if (matchingUser) {
          const userData = matchingUser.data();
          return {
            uid: matchingUser.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            role: userData.role
          };
        }
        
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
  async addStudentToCourse(courseId: string, studentEmail: string, teacherName?: string): Promise<void> {
    console.log(`[studentsService] addStudentToCourse llamado`);
    console.log(`[studentsService] Parámetros:`, {
      courseId,
      studentEmail,
      normalizedEmail: studentEmail.toLowerCase().trim(),
      teacherName
    });
    
    try {
      console.log(`[studentsService] Intentando agregar estudiante al curso:`, {
        courseId,
        studentEmail,
        normalizedEmail: studentEmail.toLowerCase().trim()
      });
      
      // Obtener información del curso (título y nombre del docente)
      let courseTitle = '';
      let finalTeacherName = teacherName || '';
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          courseTitle = courseData.title || '';
          if (!finalTeacherName) {
            finalTeacherName = courseData.teacherName || '';
          }
          console.log(`[studentsService] Información del curso obtenida:`, {
            title: courseTitle,
            teacherName: finalTeacherName
          });
        }
      } catch (courseError) {
        console.error(`[studentsService] Error obteniendo información del curso:`, courseError);
      }
      
      // Buscar el usuario por correo
      const user = await this.findUserByEmail(studentEmail);
      
      if (!user) {
        console.error(`[ERROR] No se encontró usuario con email: ${studentEmail}`);
        console.error(`[ERROR] Email normalizado buscado: ${studentEmail.toLowerCase().trim()}`);
        
        // Intentar listar todos los usuarios para debugging
        try {
          const allUsersSnapshot = await getDocs(collection(db, 'users'));
          console.log(`[DEBUG] Total de usuarios en la base de datos: ${allUsersSnapshot.size}`);
          
          const students: Array<{email: string; role: string; uid: string}> = [];
          const allUsers: Array<{email: string; role: string; uid: string}> = [];
          
          allUsersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const userInfo = {
              email: data.email || '(sin email)',
              role: data.role || '(sin rol)',
              uid: doc.id
            };
            allUsers.push(userInfo);
            if (data.role === 'student') {
              students.push(userInfo);
            }
          });
          
          console.log(`[DEBUG] Total de estudiantes encontrados: ${students.length}`);
          console.log(`[DEBUG] Lista de estudiantes disponibles:`);
          students.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.email} (UID: ${s.uid})`);
          });
          
          console.log(`[DEBUG] Todos los usuarios (primeros 10):`);
          allUsers.slice(0, 10).forEach((u, i) => {
            console.log(`  ${i + 1}. ${u.email} (Rol: ${u.role}, UID: ${u.uid})`);
          });
          
          // Verificar si hay algún email similar
          const normalizedSearch = studentEmail.toLowerCase().trim();
          const similarEmails = allUsers.filter(u => 
            u.email.toLowerCase().includes(normalizedSearch) || 
            normalizedSearch.includes(u.email.toLowerCase())
          );
          
          if (similarEmails.length > 0) {
            console.log(`[DEBUG] Emails similares encontrados:`);
            similarEmails.forEach(e => {
              console.log(`  - ${e.email} (Rol: ${e.role})`);
            });
          }
        } catch (debugError) {
          console.error('[ERROR] Error al listar usuarios para debugging:', debugError);
        }
        
        throw new Error(
          `No se encontró un usuario con el correo electrónico: ${studentEmail}\n\n` +
          `Posibles causas:\n` +
          `1. El estudiante no ha iniciado sesión al menos una vez\n` +
          `2. El email no coincide exactamente (verifica mayúsculas/minúsculas)\n` +
          `3. El estudiante se registró con un email diferente\n\n` +
          `Revisa la consola del navegador (F12) para ver la lista de estudiantes disponibles.`
        );
      }
      
      console.log(`[DEBUG] Usuario encontrado:`, {
        uid: user.uid,
        email: user.email,
        role: user.role,
        displayName: user.displayName
      });
      
      if (user.role !== 'student') {
        throw new Error(`El usuario no es un estudiante. Rol actual: ${user.role}`);
      }
      
      // Verificar si ya está inscrito (solo enrollments activos con el studentId EXACTO)
      const enrollmentRef = collection(db, 'courses', courseId, 'enrollments');
      const existingQuery = query(
        enrollmentRef,
        where('studentId', '==', user.uid),
        where('status', '==', 'active')
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      console.log(`[DEBUG] Verificación de enrollments existentes:`, {
        studentId: user.uid,
        courseId: courseId,
        enrollmentsEncontrados: existingSnapshot.size
      });
      
      if (!existingSnapshot.empty) {
        console.log(`[DEBUG] El estudiante ya está inscrito en el curso (enrollment activo encontrado)`);
        existingSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`[DEBUG] Enrollment existente:`, {
            id: doc.id,
            studentId: data.studentId,
            studentEmail: data.studentEmail,
            status: data.status
          });
        });
        throw new Error('El estudiante ya está inscrito en este curso');
      }
      
      console.log(`[DEBUG] No se encontraron enrollments activos. Procediendo a crear uno nuevo...`);
      
      // IMPORTANTE: NO buscar por email para evitar transferir enrollments de cuentas anteriores
      // Si hay enrollments con el mismo email pero diferente studentId, NO los tocamos
      // Solo verificamos enrollments removidos del MISMO studentId
      const removedQuery = query(
        enrollmentRef,
        where('studentId', '==', user.uid),
        where('status', '==', 'removed')
      );
      const removedSnapshot = await getDocs(removedQuery);
      
      // Si hay un enrollment removido del MISMO studentId, reactivarlo
      if (!removedSnapshot.empty) {
        const removedEnrollment = removedSnapshot.docs[0];
        console.log(`[DEBUG] Se encontró un enrollment removido del mismo studentId. Reactivándolo...`);
        console.log(`[DEBUG] Enrollment removido encontrado:`, {
          id: removedEnrollment.id,
          studentId: removedEnrollment.data().studentId,
          status: removedEnrollment.data().status
        });
        
        try {
          await updateDoc(doc(db, 'courses', courseId, 'enrollments', removedEnrollment.id), {
            status: 'active',
            enrolledAt: serverTimestamp(), // Actualizar fecha de inscripción
            studentEmail: user.email?.toLowerCase().trim() || user.email, // Actualizar email normalizado
            studentName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() // Actualizar nombre
          });
          console.log(`[DEBUG] Enrollment removido reactivado exitosamente`);
          
          // Verificar que se reactivó correctamente
          const verifySnapshot = await getDocs(query(
            enrollmentRef,
            where('studentId', '==', user.uid),
            where('status', '==', 'active')
          ));
          console.log(`[DEBUG] Verificación después de reactivar: enrollments activos encontrados:`, verifySnapshot.size);
          
          // Enviar notificación al estudiante cuando se reactiva el enrollment
          if (finalTeacherName && courseTitle) {
            try {
              await notificationsService.notifyStudentEnrolled(
                courseId,
                courseTitle,
                user.uid,
                finalTeacherName
              );
            } catch (notifError) {
              console.error(`[studentsService] Error enviando notificación de reactivación:`, notifError);
              // No fallar la reactivación si la notificación falla
            }
          }
          
          return; // Ya está inscrito, no necesitamos crear uno nuevo
        } catch (reactivateError) {
          console.error(`[ERROR] Error al reactivar enrollment:`, reactivateError);
          // Si falla la reactivación, continuamos con crear uno nuevo
        }
      }
      
      // Agregar inscripción
      const enrollmentData = {
        studentId: user.uid,
        studentEmail: user.email?.toLowerCase().trim() || user.email, // Normalizar email en enrollment
        studentName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        enrolledAt: serverTimestamp(),
        status: 'active'
      };
      
      console.log(`[DEBUG] Agregando inscripción:`, enrollmentData);
      console.log(`[DEBUG] studentId que se guardará:`, user.uid);
      console.log(`[DEBUG] Tipo de studentId:`, typeof user.uid);
      
      console.log(`[DEBUG] Intentando crear enrollment en Firestore...`);
      console.log(`[DEBUG] Ruta de la colección: courses/${courseId}/enrollments`);
      console.log(`[DEBUG] Datos a guardar:`, JSON.stringify(enrollmentData, null, 2));
      
      let enrollmentDocRef;
      try {
        enrollmentDocRef = await addDoc(enrollmentRef, enrollmentData);
        console.log(`[DEBUG] ✅ Inscripción agregada exitosamente con ID:`, enrollmentDocRef.id);
      } catch (addError: any) {
        console.error(`[ERROR] Error al crear el enrollment en Firestore:`, addError);
        console.error(`[ERROR] Detalles del error:`, {
          code: addError.code,
          message: addError.message,
          stack: addError.stack
        });
        throw new Error(`Error al crear la inscripción: ${addError.message || 'Error desconocido'}`);
      }
      
      // Verificar que se guardó correctamente
      console.log(`[DEBUG] Verificando que el enrollment se guardó correctamente...`);
      const verifySnapshot = await getDocs(query(
        enrollmentRef,
        where('studentId', '==', user.uid),
        where('status', '==', 'active')
      ));
      console.log(`[DEBUG] Verificación: enrollments encontrados después de agregar:`, verifySnapshot.size);
      if (verifySnapshot.size > 0) {
        verifySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`[DEBUG]   - Enrollment verificado:`, {
            id: doc.id,
            studentId: data.studentId,
            status: data.status,
            studentEmail: data.studentEmail,
            enrolledAt: data.enrolledAt
          });
        });
        
        // Enviar notificación al estudiante cuando se crea el enrollment
        if (finalTeacherName && courseTitle) {
          try {
            await notificationsService.notifyStudentEnrolled(
              courseId,
              courseTitle,
              user.uid,
              finalTeacherName
            );
            console.log(`[studentsService] ✅ Notificación de inscripción enviada al estudiante`);
          } catch (notifError) {
            console.error(`[studentsService] Error enviando notificación de inscripción:`, notifError);
            // No fallar la inscripción si la notificación falla
          }
        } else {
          console.warn(`[studentsService] No se pudo enviar notificación: falta información del curso o docente`);
        }
      } else {
        console.warn(`[WARNING] No se encontró el enrollment después de crearlo. Esto podría indicar un problema.`);
      }
    } catch (error) {
      console.error('Error agregando estudiante al curso:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los estudiantes de un curso
   */
  async getCourseStudents(courseId: string): Promise<Student[]> {
    console.log(`[studentsService] getCourseStudents llamado con courseId:`, courseId);
    try {
      const enrollmentRef = collection(db, 'courses', courseId, 'enrollments');
      const q = query(enrollmentRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      console.log(`[studentsService] getCourseStudents: Enrollments activos encontrados:`, snapshot.size);
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`[studentsService]   Enrollment ${index + 1}:`, {
          id: doc.id,
          studentId: data.studentId,
          studentEmail: data.studentEmail,
          studentName: data.studentName,
          status: data.status,
          enrolledAt: data.enrolledAt
        });
      });
      
      const students = snapshot.docs.map(doc => {
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
      
      console.log(`[studentsService] getCourseStudents: Retornando ${students.length} estudiantes`);
      return students;
    } catch (error) {
      console.error('[studentsService] Error obteniendo estudiantes del curso:', error);
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

