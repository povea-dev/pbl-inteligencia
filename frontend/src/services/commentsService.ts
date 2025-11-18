import { collection, addDoc, query, where, getDocs, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TeacherComment } from '../types';

/**
 * Servicio para gestionar comentarios de docentes en conversaciones
 */
export const commentsService = {
  /**
   * Agrega un comentario del docente a una conversación
   */
  async addComment(
    conversationId: string,
    courseId: string,
    teacherId: string,
    teacherName: string,
    comment: string,
    isPrivate: boolean = false
  ): Promise<string> {
    const commentsRef = collection(
      db,
      'courses',
      courseId,
      'conversations',
      conversationId,
      'teacherComments'
    );

    const docRef = await addDoc(commentsRef, {
      conversationId,
      teacherId,
      teacherName,
      comment,
      isPrivate,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  },

  /**
   * Obtiene todos los comentarios de una conversación
   */
  async getComments(
    conversationId: string,
    courseId: string,
    isTeacher: boolean = false
  ): Promise<TeacherComment[]> {
    const commentsRef = collection(
      db,
      'courses',
      courseId,
      'conversations',
      conversationId,
      'teacherComments'
    );

    let commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));

    // Si no es docente, solo mostrar comentarios públicos
    if (!isTeacher) {
      commentsQuery = query(
        commentsRef,
        where('isPrivate', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      } as TeacherComment;
    });
  },

  /**
   * Elimina un comentario
   */
  async deleteComment(
    conversationId: string,
    courseId: string,
    commentId: string
  ): Promise<void> {
    const commentRef = doc(
      db,
      'courses',
      courseId,
      'conversations',
      conversationId,
      'teacherComments',
      commentId
    );
    await deleteDoc(commentRef);
  }
};

