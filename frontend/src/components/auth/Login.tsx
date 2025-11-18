import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/authService";
import { Eye, EyeOff, GraduationCap, User, Mail, Lock, Brain, Sparkles, X } from "lucide-react";

type Role = "teacher" | "student";
type ModalType = "terms" | "privacy" | null;

export default function Login() {
  const nav = useNavigate();

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
    setLoading(true);
    try {
      if (isRegister) {
        if (!firstName.trim() || !lastName.trim()) {
          setErr("Por favor, completa tu nombre y apellido");
          setLoading(false);
          return;
        }
        await register(email, password, role, firstName.trim(), lastName.trim());
      } else {
        await login(email, password);
      }
      const target = role === "teacher" ? "/teacher" : "/student";
      nav(target, { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) setErr(error.message);
      else setErr("Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 p-6 lg:p-12 relative z-10">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-8 lg:p-12 relative">
          <div className="relative z-10 space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-lg shadow-emerald-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-slate-800 text-2xl font-bold tracking-tight">PBL Classroom</span>
            </div>
            
            {/* Main Content */}
            <div className="max-w-lg space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight animate-fade-in-up">
                Aprendizaje Basado en Problemas con{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 animate-gradient">
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
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-slate-600 font-medium">Plataforma segura</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-teal-500 rounded-full shadow-lg shadow-teal-500/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-slate-600 font-medium">Tiempo real</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 group-hover:scale-125 transition-transform"></div>
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
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-6 border border-emerald-200/50 shadow-sm">
                    <Sparkles className="w-10 h-10 text-emerald-600" />
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
                    }}
                    className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      !isRegister
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setErr("");
                    }}
                    className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isRegister
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
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
                            <User className="w-4 h-4 text-emerald-600" />
                            Nombre
                          </span>
                        </label>
                        <div className="relative group">
                          <input
                            id="firstName"
                            className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:border-slate-300"
                            placeholder="Juan"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            type="text"
                            required={isRegister}
                            disabled={loading}
                          />
                          <User className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            Apellido
                          </span>
                        </label>
                        <div className="relative group">
                          <input
                            id="lastName"
                            className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:border-slate-300"
                            placeholder="Pérez"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            type="text"
                            required={isRegister}
                            disabled={loading}
                          />
                          <User className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Correo Electrónico
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      className="w-full px-5 py-4 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:border-slate-300"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      disabled={loading}
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Contraseña
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      className="w-full px-5 py-4 pl-14 pr-16 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:border-slate-300"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
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
                </div>

                {/* Role Selection */}
                {isRegister && (
                  <div className="space-y-3 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        Tipo de Cuenta
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        disabled={loading}
                        className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-3 group ${
                          role === "student"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/20 scale-105"
                            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-lg shadow-teal-500/20 scale-105"
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
                {err && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 backdrop-blur-sm animate-shake">
                    <p className="text-red-700 text-sm font-medium text-center">{err}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
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

              {/* Terms */}
              <div className="px-10 pb-10 pt-6 border-t border-slate-200">
                <p className="text-center text-xs text-slate-500 leading-relaxed">
                  Al {isRegister ? "registrarte" : "iniciar sesión"}, aceptas nuestros{" "}
                  <button
                    onClick={() => setOpenModal("terms")}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors underline-offset-2 hover:underline"
                  >
                    Términos de Servicio
                  </button>{" "}
                  y{" "}
                  <button
                    onClick={() => setOpenModal("privacy")}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors underline-offset-2 hover:underline"
                  >
                    Política de Privacidad
                  </button>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-xs text-slate-500">
                © 2024 PBL Classroom. Educación impulsada por IA.
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
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
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
            <div className="px-6 py-6 overflow-y-auto flex-1">
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-emerald-500/25"
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
    </div>
  );
}