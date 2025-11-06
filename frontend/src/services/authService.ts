import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import type { AppUser, UserRole } from "../types";

export async function register(email: string, password: string, role: UserRole) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const ref = doc(db, "users", cred.user.uid);
  await setDoc(ref, {
    uid: cred.user.uid,
    email,
    role,
    createdAt: serverTimestamp(),
  }, { merge: true });
  return cred.user;
}

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getCurrentUserWithRole(u: User | null): Promise<AppUser | null> {
  if (!u) return null;
  const snap = await getDoc(doc(db, "users", u.uid));
  const role = (snap.exists() ? snap.data()?.role : "student") as UserRole;
  return { uid: u.uid, email: u.email, role, displayName: u.displayName ?? undefined };
}

export function onAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return await getIdToken(auth.currentUser, true);
}
