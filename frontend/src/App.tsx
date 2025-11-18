import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { getCurrentUserWithRole, logout } from "./services/authService";

// Componentes
import Login from "./components/auth/Login";
import { TeacherHome } from "./components/teacher/TeacherHome";
import { StudentHome } from "./components/student/StudentHome";
import { ChatContainer } from "./components/chat/ChatContainer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import type { AppUser } from "./types";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  const [user, setUser] = useState<AppUser | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const appUser = await getCurrentUserWithRole(firebaseUser);
        if (isMounted) {
          setUser(appUser);
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        if (isMounted) {
          setUser(null);
        }
      }
    });
    
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
      <Route 
        path="/login" 
        element={<Login />}
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute user={user} requiredRole="teacher">
            <TeacherHome user={user as AppUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute user={user} requiredRole="student">
            <StudentHome user={user as AppUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/course/:courseId/chat"
        element={
          <ProtectedRoute user={user}>
            <ChatContainer user={user as AppUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <Navigate 
              to={user.role === 'teacher' ? '/teacher' : '/student'} 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          user ? (
            <Navigate 
              to={user.role === 'teacher' ? '/teacher' : '/student'} 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
    </ThemeProvider>
  );
}