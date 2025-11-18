import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, register, signInWithGoogle, signInWithMicrosoft, resendVerificationEmail, updateUserRole, detectRoleFromEmail, sendPasswordReset, resetPasswordWithCode } from "../../services/authService";
import { auth } from "../../config/firebase";
import { Eye, EyeOff, GraduationCap, User, Mail, Lock, Brain, Sparkles, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

import uachLogo from "../../assets/logos/ua-logo.png";

type Role = "teacher" | "student";
type ModalType = "terms" | "privacy" | null;

export default function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [roleManuallySelected, setRoleManuallySelected] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [passwordResetSent, setPasswordResetSent] = useState<boolean>(false);
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetPasswordCode, setResetPasswordCode] = useState<string>("");
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string>("");

  // Verificar si viene de una redirección por email no verificado, verificación de email o reset de contraseña
  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
        // Si viene del link de restablecimiento de contraseña
        if (mode === 'resetPassword' && oobCode) {
          setResetPasswordCode(oobCode);
          setLoading(true);
          // Obtener el email del código de acción
          const getEmailFromCode = async () => {
            try {
              const { checkActionCode } = await import("firebase/auth");
              const { auth } = await import("../../config/firebase");
              const info = await checkActionCode(auth, oobCode);
              const email = info.data.email || '';
              setResetPasswordEmail(email);
              setShowResetPassword(true);
            } catch (error: any) {
              console.error('Error obteniendo email del código:', error);
              setErr('El link de restablecimiento es inválido o ha expirado.');
            } finally {
              setLoading(false);
            }
          };
          getEmailFromCode();
          // Limpiar parámetros de la URL
          window.history.replaceState({}, '', '/login');
          return;
        }
    
    // Si viene del link de verificación de Firebase
    if (mode === 'verifyEmail' && oobCode) {
      setLoading(true);
      setErr('');
      
      // Verificar el email usando el código
      const verifyEmail = async () => {
        try {
          const { verifyEmailWithCode, getCurrentUserWithRole } = await import("../../services/authService");
          const { email, needsLogin } = await verifyEmailWithCode(oobCode);
          
          // Limpiar parámetros de la URL
          window.history.replaceState({}, '', '/login');
          
          // Esperar un momento para que Firebase actualice el estado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar si el usuario está autenticado después de verificar
          // Cuando el usuario se registra, Firebase lo autentica automáticamente
          // Y cuando verifica el email, la sesión debería seguir activa
          if (auth.currentUser && auth.currentUser.email === email) {
            // Recargar el usuario para obtener el estado actualizado
            await auth.currentUser.reload();
            
            // Obtener el usuario con su rol
            const appUser = await getCurrentUserWithRole(auth.currentUser);
            if (appUser) {
              const target = appUser.role === "teacher" ? "/teacher" : "/student";
              // Usar window.location para forzar recarga completa y actualizar el estado
              window.location.href = target;
              return;
            }
          }
          
          // Si no está autenticado, pre-llenar el email y mostrar mensaje
          if (email) {
            setEmail(email);
          }
          setEmailVerificationSent(false);
          setErr('');
          setLoading(false);
          alert('Email verificado correctamente. Por favor, inicia sesión con tu correo y contraseña.');
        } catch (error: any) {
          console.error('Error verificando email:', error);
          setErr(error.message || 'Error al verificar el email. Por favor, intenta nuevamente.');
          setLoading(false);
          // Limpiar parámetros de la URL
          window.history.replaceState({}, '', '/login');
        }
      };
      
      verifyEmail();
    } else if (verifyParam === 'true') {
      setEmailVerificationSent(true);
      setErr('Por favor, verifica tu correo electrónico antes de continuar.');
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, nav]);

  // Este useEffect se maneja en App.tsx, no necesitamos duplicarlo aquí

  // Cerrar modal con tecla Escape y prevenir scroll del body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openModal) {
        setOpenModal(null);
      }
    };
    
    if (openModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [openModal]);

  async function submit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErr("");
    setEmailVerificationSent(false);
    setLoading(true);
    try {
      if (isRegister) {
        if (!firstName.trim() || !lastName.trim()) {
          setErr("Por favor, completa tu nombre y apellido");
          setLoading(false);
          return;
        }
        // Respetar la selección manual del usuario
        // Si el usuario seleccionó manualmente un rol, usar ese
        // Solo detectar automáticamente si el usuario no ha cambiado el rol desde el default
        let roleToUse = role;
        
        // Si el usuario NO ha seleccionado manualmente un rol (roleManuallySelected es false),
        // entonces intentar detectarlo del correo
        if (!roleManuallySelected) {
          const detectedRole = detectRoleFromEmail(email);
          if (detectedRole) {
            roleToUse = detectedRole;
          }
        }
        // Si roleManuallySelected es true, usar el rol seleccionado (no sobrescribir)
        
        await register(email, password, roleToUse, firstName.trim(), lastName.trim());
        // Mostrar mensaje de verificación
        setEmailVerificationSent(true);
        setErr("");
      } else {
        const userCred = await login(email, password);
        // Recargar el usuario para asegurar que tenemos el estado más reciente
        await userCred.reload();
        
        // Obtener el rol del usuario desde Firestore
        const { getCurrentUserWithRole } = await import("../../services/authService");
        const appUser = await getCurrentUserWithRole(userCred);
        if (appUser) {
          // Forzar actualización del estado en App.tsx recargando la página
          // Esto asegura que el rol se muestre correctamente
          const target = appUser.role === "teacher" ? "/teacher" : "/student";
          window.location.href = target;
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message);
        // Si el error menciona verificación, mostrar el mensaje especial
        if (error.message.includes('verifica tu correo')) {
          setEmailVerificationSent(true);
        }
      } else {
        setErr("Error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setErr("");
    setEmailVerificationSent(false);
    setLoading(true);
    try {
      const { user } = await signInWithGoogle(null);
      
      // Verificar si el usuario ya existe en Firestore
      const { getCurrentUserWithRole } = await import("../../services/authService");
      const appUser = await getCurrentUserWithRole(user);
      
      // Si el usuario ya existe y tiene un rol guardado, redirigir directamente
      if (appUser && appUser.role) {
        const target = appUser.role === "teacher" ? "/teacher" : "/student";
        nav(target, { replace: true });
        return;
      }
      
      // Si es un usuario nuevo o no tiene rol, mostrar modal para seleccionar
      const detectedRole = detectRoleFromEmail(user.email);
      
      if (detectedRole) {
        // Preseleccionar el rol detectado
        setRole(detectedRole);
      }
      
      // Mostrar modal solo para usuarios nuevos
      setPendingOAuthUser({ uid: user.uid, email: user.email });
      setShowRoleModal(true);
      setLoading(false);
    } catch (error: any) {
      // Manejar errores específicos de Firebase Auth
      const errorCode = error?.code || '';
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setErr("Inicio de sesión cancelado");
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        setErr("Ya existe una cuenta con este correo. Por favor, inicia sesión con tu método original.");
      } else if (errorCode === 'auth/popup-blocked') {
        setErr("El popup fue bloqueado. Por favor, permite popups para este sitio.");
      } else {
        setErr(error?.message || "Error al iniciar sesión con Google");
      }
      setLoading(false);
    }
  }

  async function handleMicrosoftSignIn() {
    setErr("");
    setEmailVerificationSent(false);
    setLoading(true);
    try {
      const { user } = await signInWithMicrosoft(null);
      
      // Verificar si el usuario ya existe en Firestore
      const { getCurrentUserWithRole } = await import("../../services/authService");
      const appUser = await getCurrentUserWithRole(user);
      
      // Si el usuario ya existe y tiene un rol guardado, redirigir directamente
      if (appUser && appUser.role) {
        const target = appUser.role === "teacher" ? "/teacher" : "/student";
        nav(target, { replace: true });
        return;
      }
      
      // Si es un usuario nuevo o no tiene rol, mostrar modal para seleccionar
      const detectedRole = detectRoleFromEmail(user.email);
      
      if (detectedRole) {
        // Preseleccionar el rol detectado
        setRole(detectedRole);
      }
      
      // Mostrar modal solo para usuarios nuevos
      setPendingOAuthUser({ uid: user.uid, email: user.email });
      setShowRoleModal(true);
      setLoading(false);
    } catch (error: any) {
      // Manejar errores específicos de Firebase Auth
      const errorCode = error?.code || '';
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setErr("Inicio de sesión cancelado");
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        setErr("Ya existe una cuenta con este correo. Por favor, inicia sesión con tu método original.");
      } else if (errorCode === 'auth/popup-blocked') {
        setErr("El popup fue bloqueado. Por favor, permite popups para este sitio.");
      } else {
        setErr(error?.message || "Error al iniciar sesión con Microsoft");
      }
      setLoading(false);
    }
  }

  async function handleRoleSelection(selectedRole: Role) {
    if (!pendingOAuthUser) return;
    
    setLoading(true);
    try {
      // Actualizar el rol en Firestore
      await updateUserRole(pendingOAuthUser.uid, selectedRole);
      
      // Esperar un momento para que Firestore se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar que el rol se actualizó correctamente
      const { getCurrentUserWithRole } = await import("../../services/authService");
      const { auth } = await import("../../config/firebase");
      
      if (auth.currentUser) {
        const updatedUser = await getCurrentUserWithRole(auth.currentUser);
        if (updatedUser && updatedUser.role !== selectedRole) {
          // Si el rol no se actualizó, esperar un poco más y reintentar
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryUser = await getCurrentUserWithRole(auth.currentUser);
          if (retryUser && retryUser.role !== selectedRole) {
            throw new Error('No se pudo actualizar el rol. Por favor, recarga la página.');
          }
        }
      }
      
      setShowRoleModal(false);
      setPendingOAuthUser(null);
      
      // Forzar recarga completa de la página para asegurar que el estado del usuario se actualice
      // Esto es necesario porque App.tsx no se actualiza automáticamente cuando cambiamos datos en Firestore
      window.location.href = selectedRole === "teacher" ? "/teacher" : "/student";
    } catch (error: any) {
      setErr(error?.message || "Error al actualizar el rol");
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResendingEmail(true);
    setErr("");
    try {
      await resendVerificationEmail();
      setEmailVerificationSent(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Error al reenviar el correo de verificación");
      }
    } finally {
      setResendingEmail(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotPasswordEmail.trim()) {
      setErr("Por favor, ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      await sendPasswordReset(forgotPasswordEmail);
      setPasswordResetSent(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setErr("No existe una cuenta con este correo electrónico");
      } else {
        setErr(error.message || "Error al enviar el correo de restablecimiento");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErr("Por favor, completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Las contraseñas no coinciden");
      return;
    }

    if (!resetPasswordCode) {
      setErr("Código de restablecimiento inválido");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      await resetPasswordWithCode(resetPasswordCode, newPassword);
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setResetPasswordCode("");
      setErr("");
      alert("Contraseña restablecida correctamente. Por favor, inicia sesión con tu nueva contraseña.");
    } catch (error: any) {
      if (error.code === 'auth/expired-action-code') {
        setErr("El link de restablecimiento ha expirado. Por favor, solicita uno nuevo.");
      } else if (error.code === 'auth/invalid-action-code') {
        setErr("El link de restablecimiento es inválido. Por favor, solicita uno nuevo.");
      } else {
        setErr(error.message || "Error al restablecer la contraseña");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 p-6 lg:p-12 relative z-10">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-8 lg:p-12 relative">
          <div className="relative z-10 space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-slate-700 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-red-200/50 shadow-lg shadow-red-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-slate-800 text-2xl font-bold tracking-tight">PBL Classroom</span>
            </div>
            
            {/* Main Content */}
            <div className="max-w-lg space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight animate-fade-in-up">
                Aprendizaje Basado en Problemas con{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-slate-700 to-slate-800 animate-gradient">
                  IA
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed animate-fade-in-up delay-100">
                Transforma tu experiencia educativa con inteligencia artificial. 
                Crea, colabora y resuelve problemas de manera innovadora.
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap items-center gap-6 pt-4 animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg shadow-red-500/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-slate-600 font-medium">Plataforma segura</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-slate-600 rounded-full shadow-lg shadow-slate-500/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-slate-600 font-medium">Tiempo real</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-slate-700 rounded-full shadow-lg shadow-slate-600/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-slate-600 font-medium">Asistente IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-10 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-slate-800 text-xl font-bold">PBL Classroom</span>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 animate-fade-in-up">
              {/* Form Header */}
              <div className="px-10 pt-10 pb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-6 border border-red-200/50 shadow-sm">
                    <Sparkles className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">
                    {isRegister ? "Crear Cuenta" : "Bienvenido de Vuelta"}
                  </h2>
                  <p className="text-slate-600 text-base">
                    {isRegister 
                      ? "Regístrate para comenzar tu experiencia educativa" 
                      : "Ingresa a tu cuenta para continuar"
                    }
                  </p>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="px-10 pb-8">
                <div className="flex bg-slate-100 rounded-2xl p-2 border border-slate-200">
                  <button
                    onClick={() => {
                      setIsRegister(false);
                      setErr("");
                      setRoleManuallySelected(false);
                    }}
                    className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      !isRegister
                        ? "bg-gradient-to-r from-red-600 to-slate-700 text-white shadow-lg shadow-red-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setErr("");
                      setRoleManuallySelected(false);
                    }}
                    className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isRegister
                        ? "bg-gradient-to-r from-red-600 to-slate-700 text-white shadow-lg shadow-red-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    Registrarse
                  </button>
                </div>
              </div>

              <form onSubmit={submit} className="px-10 pb-10 space-y-6">
                {/* Name Fields - Solo en registro */}
                {isRegister && (
                  <>
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-600" />
                            Nombre
                          </span>
                        </label>
                        <div className="relative group">
                          <input
                            id="firstName"
                            className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                            placeholder="Juan"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            type="text"
                            required={isRegister}
                            disabled={loading}
                          />
                          <User className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-600" />
                            Apellido
                          </span>
                        </label>
                        <div className="relative group">
                          <input
                            id="lastName"
                            className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                            placeholder="Pérez"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            type="text"
                            required={isRegister}
                            disabled={loading}
                          />
                          <User className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-600" />
                      Correo Electrónico
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Detectar rol automáticamente cuando se ingresa el correo
                        // Solo si el usuario no ha seleccionado manualmente un rol
                        if (isRegister && !roleManuallySelected) {
                          const detectedRole = detectRoleFromEmail(e.target.value);
                          if (detectedRole) {
                            setRole(detectedRole);
                          }
                        }
                      }}
                      type="email"
                      required
                      disabled={loading}
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                  </div>
                  {isRegister && email && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {detectRoleFromEmail(email) === 'teacher' && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>Rol detectado: <strong>Docente</strong> (@uautonoma.cl)</span>
                        </>
                      )}
                      {detectRoleFromEmail(email) === 'student' && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>Rol detectado: <strong>Estudiante</strong> (@cloud.uautonoma.cl)</span>
                        </>
                      )}
                      {!detectRoleFromEmail(email) && email.includes('@') && (
                        <>
                          <AlertCircle className="w-3 h-3 text-yellow-600" />
                          <span>Selecciona manualmente tu tipo de cuenta</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-600" />
                      Contraseña
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      className="w-full px-5 py-4 pl-14 pr-16 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Enlace "¿Olvidaste tu contraseña?" - Fuera del div relativo */}
                  {!isRegister && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordEmail(email);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        disabled={loading}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </div>

                {/* Role Selection */}
                {isRegister && (
                  <div className="space-y-3 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-red-600" />
                        Tipo de Cuenta
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setRole("student");
                          setRoleManuallySelected(true);
                        }}
                        disabled={loading}
                        className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-3 group ${
                          role === "student"
                            ? "border-red-600 bg-red-50 text-red-700 shadow-lg shadow-red-500/20 scale-105"
                            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <GraduationCap className={`w-6 h-6 transition-transform ${role === "student" ? "scale-110" : ""}`} />
                        <span className="text-sm font-semibold">Estudiante</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRole("teacher");
                          setRoleManuallySelected(true);
                        }}
                        disabled={loading}
                        className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-3 group ${
                          role === "teacher"
                            ? "border-slate-700 bg-slate-50 text-slate-700 shadow-lg shadow-slate-500/20 scale-105"
                            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <User className={`w-6 h-6 transition-transform ${role === "teacher" ? "scale-110" : ""}`} />
                        <span className="text-sm font-semibold">Docente</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {err && !emailVerificationSent && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 backdrop-blur-sm animate-shake">
                    <p className="text-red-700 text-sm font-medium text-center">{err}</p>
                  </div>
                )}

                {/* Email Verification Message */}
                {emailVerificationSent && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-blue-800 text-sm font-semibold mb-2">
                          Correo de verificación enviado
                        </p>
                        <p className="text-blue-700 text-xs mb-3">
                          Hemos enviado un correo de verificación a <strong>{email}</strong>. 
                          Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
                        </p>
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendingEmail}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendingEmail ? 'Reenviando...' : 'Reenviar correo de verificación'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-slate-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-slate-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
                    type="submit"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cargando...</span>
                      </div>
                    ) : (
                      <span>{isRegister ? "Crear Cuenta" : "Iniciar Sesión"}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* OAuth Buttons */}
              {!emailVerificationSent && (
                <>
                  <div className="px-10 py-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-white text-slate-500">O continúa con</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-10 pb-6 space-y-3">
                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continuar con Google</span>
                    </button>

                    {/* Microsoft Button */}
                    <button
                      type="button"
                      onClick={handleMicrosoftSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 23 23">
                        <path fill="#f25022" d="M0 0h11v11H0z"/>
                        <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                        <path fill="#7fba00" d="M0 12h11v11H0z"/>
                        <path fill="#ffb900" d="M12 12h11v11H12z"/>
                      </svg>
                      <span>Continuar con Microsoft</span>
                    </button>
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="px-10 pb-10 pt-6 border-t border-slate-200">
                <p className="text-center text-xs text-slate-500 leading-relaxed">
                  Al {isRegister ? "registrarte" : "iniciar sesión"}, aceptas nuestros{" "}
                  <button
                    onClick={() => setOpenModal("terms")}
                    className="text-red-600 hover:text-red-700 font-semibold transition-colors underline-offset-2 hover:underline"
                  >
                    Términos de Servicio
                  </button>{" "}
                  y{" "}
                  <button
                    onClick={() => setOpenModal("privacy")}
                    className="text-red-600 hover:text-red-700 font-semibold transition-colors underline-offset-2 hover:underline"
                  >
                    Política de Privacidad
                  </button>
                </p>
              </div>
            </div>

            {/* Modal para seleccionar rol (OAuth) */}
            {showRoleModal && pendingOAuthUser && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-4 border border-red-200/50">
                      <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Selecciona tu tipo de cuenta
                    </h3>
                    <p className="text-slate-600 text-sm mb-2">
                      Correo: <strong>{pendingOAuthUser.email}</strong>
                    </p>
                    {detectRoleFromEmail(pendingOAuthUser.email) && (
                      <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Rol sugerido: <strong>{detectRoleFromEmail(pendingOAuthUser.email) === 'teacher' ? 'Docente' : 'Estudiante'}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      disabled={loading}
                      className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-3 group ${
                        role === "student"
                          ? "border-red-600 bg-red-50 text-red-700 shadow-lg shadow-red-500/20 scale-105"
                          : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 hover:scale-105"
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      <GraduationCap className={`w-6 h-6 transition-transform ${role === "student" ? "scale-110" : ""}`} />
                      <span className="text-sm font-semibold">Estudiante</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      disabled={loading}
                      className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-3 group ${
                        role === "teacher"
                          ? "border-slate-700 bg-slate-50 text-slate-700 shadow-lg shadow-slate-500/20 scale-105"
                          : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 hover:scale-105"
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      <User className={`w-6 h-6 transition-transform ${role === "teacher" ? "scale-110" : ""}`} />
                      <span className="text-sm font-semibold">Docente</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      <strong>Nota:</strong> Los correos <code className="bg-blue-100 px-1 rounded">@uautonoma.cl</code> son para docentes y <code className="bg-blue-100 px-1 rounded">@cloud.uautonoma.cl</code> para estudiantes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRoleSelection(role)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-slate-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-slate-800 transition-all font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Procesando..." : "Continuar"}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8 space-y-4">
              {/* Logo Universidad Autónoma de Chile */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center">
                  <img 
                    src={uachLogo} 
                    alt="Universidad Autónoma de Chile" 
                    className="h-20 w-auto object-contain max-w-xs"
                  />
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                © 2025 PBL Classroom. Educación impulsada por IA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Privacy Modal */}
      {openModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setOpenModal(null)}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up mx-2 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-slate-50">
              <h3 className="text-2xl font-bold text-slate-900">
                {openModal === "terms" ? "Términos de Servicio" : "Política de Privacidad"}
              </h3>
              <button
                onClick={() => setOpenModal(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto flex-1">
              {openModal === "terms" ? (
                <div className="space-y-4 text-slate-700 prose prose-slate max-w-none">
                  <p className="text-sm text-slate-500 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">1. Aceptación de los Términos</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Al acceder y utilizar PBL Classroom, aceptas cumplir con estos Términos de Servicio. 
                      Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">2. Descripción del Servicio</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      PBL Classroom es una plataforma educativa que utiliza inteligencia artificial para facilitar 
                      el aprendizaje basado en problemas. Ofrecemos herramientas para estudiantes y docentes 
                      para crear, colaborar y resolver problemas educativos.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">3. Cuentas de Usuario</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Para utilizar nuestros servicios, debes crear una cuenta proporcionando información precisa 
                      y completa. Eres responsable de mantener la confidencialidad de tu contraseña y de todas 
                      las actividades que ocurran bajo tu cuenta.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">4. Uso Aceptable</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Te comprometes a utilizar PBL Classroom únicamente para fines educativos legítimos. 
                      No debes usar el servicio para actividades ilegales, acosar a otros usuarios, o 
                      intentar acceder no autorizado a sistemas o datos.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">5. Propiedad Intelectual</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Todo el contenido de PBL Classroom, incluyendo diseño, texto, gráficos y software, 
                      es propiedad de PBL Classroom o sus licenciantes. Conservas los derechos sobre el 
                      contenido que creas y compartes en la plataforma.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">6. Limitación de Responsabilidad</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      PBL Classroom se proporciona "tal cual" sin garantías de ningún tipo. No seremos 
                      responsables por daños indirectos, incidentales o consecuentes derivados del uso 
                      o la imposibilidad de usar nuestro servicio.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">7. Modificaciones</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                      Las modificaciones entrarán en vigor al publicarse en la plataforma. 
                      El uso continuado del servicio después de los cambios constituye tu aceptación.
                    </p>
                  </section>
                </div>
              ) : (
                <div className="space-y-4 text-slate-700 prose prose-slate max-w-none">
                  <p className="text-sm text-slate-500 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">1. Información que Recopilamos</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Recopilamos información que nos proporcionas directamente, como nombre, dirección de correo 
                      electrónico, y el rol (estudiante o docente). También recopilamos información sobre tu uso 
                      de la plataforma, incluyendo interacciones con la IA y contenido que creas.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">2. Uso de la Información</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, 
                      personalizar tu experiencia, comunicarnos contigo sobre el servicio, y cumplir con 
                      obligaciones legales. No vendemos tu información personal a terceros.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">3. Inteligencia Artificial</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Utilizamos tecnologías de inteligencia artificial para mejorar tu experiencia educativa. 
                      Las interacciones con la IA pueden ser procesadas y almacenadas para mejorar el servicio. 
                      No utilizamos tus datos personales para entrenar modelos de IA de terceros sin tu consentimiento.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">4. Seguridad de los Datos</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
                      personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, 
                      ningún método de transmisión por Internet es 100% seguro.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">5. Compartir Información</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      No compartimos tu información personal excepto en las siguientes circunstancias: con tu 
                      consentimiento explícito, para cumplir con la ley, para proteger nuestros derechos, o 
                      con proveedores de servicios que nos ayudan a operar la plataforma bajo estrictos acuerdos 
                      de confidencialidad.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">6. Tus Derechos</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Tienes derecho a acceder, corregir, eliminar o restringir el procesamiento de tu información 
                      personal. Puedes solicitar una copia de tus datos o cerrar tu cuenta en cualquier momento 
                      a través de la configuración de tu perfil.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">7. Cookies y Tecnologías Similares</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso 
                      de la plataforma y personalizar el contenido. Puedes controlar el uso de cookies a través 
                      de la configuración de tu navegador.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">8. Menores de Edad</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Nuestro servicio está dirigido a usuarios mayores de 13 años. Si eres menor de edad, 
                      debes obtener el consentimiento de tus padres o tutores antes de utilizar la plataforma. 
                      No recopilamos intencionalmente información de menores sin el consentimiento apropiado.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">9. Cambios a esta Política</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre 
                      cambios significativos publicando la nueva política en la plataforma y actualizando 
                      la fecha de "última actualización".
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">10. Contacto</h4>
                    <p className="text-sm leading-relaxed mb-4">
                      Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información, 
                      puedes contactarnos a través de la plataforma o por correo electrónico.
                    </p>
                  </section>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setOpenModal(null)}
                className="w-full bg-gradient-to-r from-red-600 to-slate-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-slate-800 transition-all font-semibold shadow-lg shadow-red-500/25"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-1000 { animation-delay: 1s; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Modal de "Olvidé mi contraseña" */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordEmail("");
            setPasswordResetSent(false);
            setErr("");
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-slate-200/50 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con icono */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-4 border-2 border-red-200/50 shadow-lg shadow-red-500/20">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Restablecer contraseña
              </h3>
              <p className="text-sm text-slate-600">
                Te enviaremos un enlace para crear una nueva contraseña
              </p>
            </div>

            {!passwordResetSent ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-600" />
                      Correo electrónico
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                      placeholder="correo@ejemplo.com"
                      disabled={loading}
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                  </div>
                </div>
                {err && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 backdrop-blur-sm animate-shake">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {err}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                      setErr("");
                    }}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Enviar enlace
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4 border-2 border-green-200 shadow-lg shadow-green-500/20 animate-scale-in">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    ¡Correo enviado!
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Hemos enviado un enlace de restablecimiento a <strong className="text-slate-900">{forgotPasswordEmail}</strong>. 
                    <br className="hidden sm:block" />
                    Por favor, revisa tu bandeja de entrada (y spam) y haz clic en el enlace para restablecer tu contraseña.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setPasswordResetSent(false);
                    setErr("");
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 transition-all"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de restablecer contraseña (cuando viene del link del email) */}
      {showResetPassword && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowResetPassword(false);
            setNewPassword("");
            setConfirmPassword("");
            setResetPasswordCode("");
            setResetPasswordEmail("");
            setErr("");
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-slate-200/50 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con icono */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-4 border-2 border-red-200/50 shadow-lg shadow-red-500/20">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Restablecer contraseña
              </h3>
              {resetPasswordEmail && (
                <p className="text-sm text-slate-600 mb-1">
                  para <strong className="text-slate-900 font-semibold">{resetPasswordEmail}</strong>
                </p>
              )}
              <p className="text-sm text-slate-600">
                Crea una contraseña segura para tu cuenta
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    Nueva contraseña
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 pl-14 pr-16 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    Confirmar contraseña
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 pl-14 pr-16 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all hover:border-slate-300"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 backdrop-blur-sm animate-shake">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {err}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetPasswordCode("");
                    setResetPasswordEmail("");
                    setErr("");
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Restableciendo...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Guardar contraseña
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}