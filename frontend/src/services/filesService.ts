import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
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
import { storage, db } from '../config/firebase';
import { CourseFile } from '../types';

export const filesService = {
  /**
   * Subir archivo al curso
   */
  async uploadFile(
    courseId: string,
    file: File,
    uploadedBy: string
  ): Promise<CourseFile> {
    try {
      // 1. Subir archivo a Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `courses/${courseId}/files/${fileName}`);
      
      await uploadBytes(storageRef, file);
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
      
      return {
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
    } catch (error) {
      console.error('Error subiendo archivo:', error);
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