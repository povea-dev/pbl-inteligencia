import { db } from "../config/firebase";
import {
  addDoc, collection, doc, getDocs, query, where, setDoc,
} from "firebase/firestore";
import type { Course } from "../types";

export async function createCourse(name: string, description: string, teacherId: string) {
  const ref = await addDoc(collection(db, "courses"), { name, description, teacherId });
  // Crea chatbot 1:1 como subcolección
  await setDoc(doc(db, "courses", ref.id, "chatbot", "meta"), {
    model: "gpt-4o-mini",
    system_prompt: "Asistente PBL…",
  });
  return ref.id;
}

export async function listMyCourses(teacherId: string): Promise<Course[]> {
  const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
