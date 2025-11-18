import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Servicio para compartir conversaciones entre usuarios
 */
export const shareService = {
  /**
   * Comparte una conversación con otros usuarios
   */
  async shareConversation(
    courseId: string,
    conversationId: string,
    userIds: string[]
  ): Promise<void> {
    const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const currentShared = conversationSnap.data().sharedWith || [];
      const newUsers = userIds.filter(id => !currentShared.includes(id));
      
      if (newUsers.length > 0) {
        await updateDoc(conversationRef, {
          sharedWith: arrayUnion(...newUsers)
        });
      }
    }
  },

  /**
   * Deja de compartir una conversación con un usuario
   */
  async unshareConversation(
    courseId: string,
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversationRef = doc(db, 'courses', courseId, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      sharedWith: arrayRemove(userId)
    });
  },

  /**
   * Obtiene las conversaciones compartidas con un usuario
   */
  async getSharedConversations(courseId: string, userId: string): Promise<string[]> {
    const conversationsRef = collection(db, 'courses', courseId, 'conversations');
    const snapshot = await getDocs(conversationsRef);
    const sharedIds: string[] = [];

    snapshot.docs.forEach(doc => {
      const sharedWith = doc.data().sharedWith || [];
      if (sharedWith.includes(userId)) {
        sharedIds.push(doc.id);
      }
    });

    return sharedIds;
  }
};

