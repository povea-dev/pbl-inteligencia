import { JSX, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";

// Componentes principales
import Login from "./components/auth/Login";
import TeacherHome from "./components/teacher/TeacherHome";
import StudentHome from "./components/student/StudentHome";


// Tipos
import type { AppUser } from "./types";

function Protected({
  allow,
  user,
  children,
}: {
  allow: Array<"teacher" | "student">;
  user: AppUser | null | undefined;
  children: JSX.Element;
}) {
  if (user === undefined)
    return <div className="h-screen grid place-items-center">Cargando…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState<AppUser | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        return;
      }

      // ⚠️ Por ahora asumimos que todos son "student"
      // Más adelante lo cargamos desde Firestore (/users/{uid})
      setUser({ uid: u.uid, email: u.email, role: "student" });
    });
    return () => unsub();
  }, []);

  return (
    <Routes>
      {/* Página de inicio de sesión */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard docente */}
      <Route
        path="/teacher"
        element={
          <Protected allow={["teacher"]} user={user}>
            <TeacherHome user={user as AppUser} />
          </Protected>
        }
      />

      {/* Dashboard estudiante */}
      <Route
        path="/student"
        element={
          <Protected allow={["student"]} user={user}>
            <StudentHome user={user as AppUser} />
          </Protected>
        }
      />

      {/* Chat por curso */}
      <Route
        path="/course/:courseId/chat"
        element={
          <Protected allow={["teacher", "student"]} user={user}>
            <CourseChat user={user as AppUser} />
          </Protected>
        }
      />

      {/* Redirección según rol o login */}
      <Route
        path="*"
        element={
          user?.role === "teacher" ? (
            <Navigate to="/teacher" replace />
          ) : user?.role === "student" ? (
            <Navigate to="/student" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
