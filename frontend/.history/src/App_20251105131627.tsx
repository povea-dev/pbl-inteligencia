import { useEffect, useState } from "react";
import { ChatContainer } from "./components/chat/ChatContainer";
import { useChatStore } from "./stores/chatStore";
import { firebaseService } from "./services/firebaseService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import type { AppUser } from "./types";

type Difficulty = "facil" | "medio" | "dificil";

type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  learningObjectives: string[];
};

export default function App() {
  const { setCurrentProblem, setCurrentSession } = useChatStore();
  const [user, setUser] = useState<AppUser | null | undefined>(undefined); // undefined = cargando

  useEffect(() => {
    // Escucha el estado de sesión de Firebase
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        return;
      }
      setUser({ uid: u.uid, email: u.email, role: "student" }); // si ya tienes rol en Firestore, cárgalo aquí
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return; // si null => no logeado; si undefined => cargando
    // Inicializa el problema y crea sesión en Firestore usando el uid del usuario autenticado
    let active = true;

    (async () => {
      const testProblem: Problem = {
        id: "test-problem-1",
        title: "Optimización de Algoritmos de Búsqueda",
        description:
          "¿Cómo mejorarías la eficiencia de un algoritmo de búsqueda en un array ordenado? Analiza diferentes enfoques y justifica tu respuesta.",
        category: "Algoritmos y Estructuras de Datos",
        difficulty: "medio",
        learningObjectives: [
          "Analizar complejidad algorítmica",
          "Comparar diferentes estrategias de búsqueda",
          "Justificar decisiones técnicas",
        ],
      };

      setCurrentProblem(testProblem);

      try {
        const sessionId = await firebaseService.createSession(user.uid, testProblem.id);
        if (!active) return;

        setCurrentSession({
          id: sessionId,
          studentId: user.uid,
          problemId: testProblem.id,
          startedAt: new Date(),
          lastActivityAt: new Date(),
          status: "active",
        });
      } catch (error) {
        console.error("Error creando sesión:", error);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, setCurrentProblem, setCurrentSession]);

  if (user === undefined) {
    return <div className="h-screen grid place-items-center">Cargando…</div>;
  }

  if (user === null) {
    // Aquí podrías redirigir a /login si ya tienes router
    return <div className="h-screen grid place-items-center">Inicia sesión para continuar.</div>;
  }

  return (
    <div className="h-screen bg-white">
      <ChatContainer />
    </div>
  );
}
