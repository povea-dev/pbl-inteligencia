import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  uploadBytesResumable,
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { storage, db, auth } from '../config/firebase';
import { CourseFile } from '../types';
import { notificationsService } from './notificationsService';

export const filesService = {
  /**
   * Subir archivo al curso
   */
  async uploadFile(
    courseId: string,
    file: File,
    uploadedBy: string,
    teacherName?: string
  ): Promise<CourseFile> {
    try {
      // Verificar que el usuario esté autenticado
      if (!auth.currentUser) {
        throw new Error('Debes estar autenticado para subir archivos');
      }

      // Esperar a que el token de autenticación esté listo
      await auth.currentUser.getIdToken(true);

      // 1. Subir archivo a Storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `courses/${courseId}/files/${fileName}`);
      
      // Determinar content type correcto
      let contentType = file.type || 'application/octet-stream';
      if (!contentType || contentType === 'application/octet-stream') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') contentType = 'application/pdf';
        else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'doc') contentType = 'application/msword';
        else if (ext === 'txt') contentType = 'text/plain';
      }
      
      // Usar uploadBytes que maneja mejor la autenticación
      await uploadBytes(storageRef, file, {
        contentType: contentType,
        customMetadata: {
          uploadedBy,
          courseId,
          originalName: file.name
        }
      });
      
      const url = await getDownloadURL(storageRef);
      
      // 2. Guardar metadata en Firestore
      const fileType = this.getFileType(file.name);
      
      const fileDoc = await addDoc(
        collection(db, 'courses', courseId, 'files'),
        {
          name: file.name,
          url,
          storagePath: `courses/${courseId}/files/${fileName}`,
          type: fileType,
          size: file.size,
          uploadedAt: serverTimestamp(),
          uploadedBy,
          processed: false
        }
      );
      
      const uploadedFile: CourseFile = {
        id: fileDoc.id,
        courseId,
        name: file.name,
        url,
        type: fileType,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy,
        processed: false
      };

      // Crear notificaciones para estudiantes si se proporciona el nombre del docente
      if (teacherName) {
        try {
          await notificationsService.notifyFileUploaded(
            courseId,
            file.name,
            fileDoc.id,
            teacherName
          );
        } catch (notifError) {
          // No fallar la subida si las notificaciones fallan
          console.error('Error creando notificaciones:', notifError);
        }
      }

      return uploadedFile;
    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Mejorar mensajes de error
      if (error.code === 'storage/unauthorized') {
        throw new Error('No tienes permisos para subir archivos. Verifica las reglas de Firebase Storage en la consola de Firebase.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('La subida del archivo fue cancelada.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Error desconocido al subir el archivo. Verifica tu conexión y las reglas de Firebase Storage.');
      } else if (error.message?.includes('CORS') || error.message?.includes('cors') || 
                 error.code === 'storage/unauthorized' || 
                 (error.message && error.message.includes('preflight'))) {
        throw new Error('Error de CORS: Las reglas de Firebase Storage no están configuradas correctamente. Ve a Firebase Console > Storage > Rules y copia las reglas del archivo firebase-storage-rules.txt');
      } else if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled') {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      // Si es un error de red o CORS genérico
      if (!error.code && (error.message?.includes('network') || error.message?.includes('Network'))) {
        throw new Error('Error de conexión. Verifica tu internet y las reglas de Firebase Storage.');
      }
      
      throw error;
    }
  },

  /**
   * Obtener todos los archivos de un curso
   */
  async getCourseFiles(courseId: string): Promise<CourseFile[]> {
    try {
      const snapshot = await getDocs(
        collection(db, 'courses', courseId, 'files')
      );
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        courseId,
        name: doc.data().name,
        url: doc.data().url,
        type: doc.data().type,
        size: doc.data().size,
        uploadedAt: (doc.data().uploadedAt as Timestamp)?.toDate() || new Date(),
        uploadedBy: doc.data().uploadedBy,
        processed: doc.data().processed || false
      }));
    } catch (error) {
      console.error('Error obteniendo archivos:', error);
      throw error;
    }
  },

  /**
   * Eliminar archivo
   */
  async deleteFile(
    courseId: string,
    fileId: string,
    storagePath: string
  ): Promise<void> {
    try {
      // 1. Eliminar de Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
      // 2. Eliminar metadata de Firestore
      await deleteDoc(doc(db, 'courses', courseId, 'files', fileId));
      
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  },

  /**
   * Marcar archivo como procesado (para embeddings)
   */
  async markAsProcessed(
    courseId: string,
    fileId: string
  ): Promise<void> {
    try {
      const fileRef = doc(db, 'courses', courseId, 'files', fileId);
      await updateDoc(fileRef, {
        processed: true
      });
    } catch (error) {
      console.error('Error marcando archivo como procesado:', error);
      throw error;
    }
  },

  /**
   * Determinar tipo de archivo
   */
  getFileType(filename: string): 'pdf' | 'docx' | 'txt' | 'other' {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
        return 'docx';
      case 'txt':
        return 'txt';
      default:
        return 'other';
    }
  },

  /**
   * Validar archivo antes de subir
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['pdf', 'docx', 'doc', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!ext || !allowedTypes.includes(ext)) {
      return { 
        valid: false, 
        error: 'Tipo de archivo no permitido. Solo PDF, DOCX y TXT.' 
      };
    }
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'El archivo es demasiado grande. Máximo 10MB.' 
      };
    }
    
    return { valid: true };
  }
};