import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
}

export const authService = {
  async register(
    email: string, 
    password: string, 
    name: string, 
    role: 'teacher' | 'student'
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      name,
      role,
      createdAt: new Date()
    });
    
    return { 
      uid: userCredential.user.uid, 
      email, 
      name, 
      role 
    };
  },

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    if (!userData) {
      throw new Error('Usuario no encontrado en Firestore');
    }
    
    return { 
      uid: userCredential.user.uid, 
      email: userData.email,
      name: userData.name,
      role: userData.role
    };
  },

  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
};