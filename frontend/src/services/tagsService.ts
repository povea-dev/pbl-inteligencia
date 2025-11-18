import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Servicio para gestionar etiquetas/categorías de conversaciones
 */
export const tagsService = {
  /**
   * Agrega una etiqueta a una conversación
   */
  async addTag(courseId: string, conversationId: string, tag: string): Promise<void> {
    const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const currentTags = conversationSnap.data().tags || [];
      if (!currentTags.includes(tag)) {
        await updateDoc(conversationRef, {
          tags: arrayUnion(tag)
        });
      }
    }
  },

  /**
   * Elimina una etiqueta de una conversación
   */
  async removeTag(courseId: string, conversationId: string, tag: string): Promise<void> {
    const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      tags: arrayRemove(tag)
    });
  },

  /**
   * Obtiene todas las etiquetas únicas de un curso
   */
  async getCourseTags(courseId: string): Promise<string[]> {
    const conversationsRef = collection(db, 'courses', courseId, 'conversations');
    const snapshot = await getDocs(conversationsRef);
    const allTags = new Set<string>();

    snapshot.docs.forEach(doc => {
      const tags = doc.data().tags || [];
      tags.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  }
};

