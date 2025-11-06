import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/authService";
import { BookOpen, User, Lock, Mail, Eye, EyeOff, GraduationCap, Users } from "lucide-react";

type Role = "teacher" | "student";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  async function submit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, role);
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

  function onEmail(e: React.ChangeEvent<HTMLInputElement>): void {
    setEmail(e.target.value);
  }
  function onPassword(e: React.ChangeEvent<HTMLInputElement>): void {
    setPassword(e.target.value);
  }
  function onRole(e: React.ChangeEvent<HTMLSelectElement>): void {
    setRole(e.target.value as Role);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 grid place-items-center p-6">
      {/* Tarjeta Principal */}
      <div className="w-full max-w-md">
        {/* Header con Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PBL Classroom
          </h1>
          <p className="text-gray-600">
            Aprendizaje Basado en Problemas con IA
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isRegister ? "Crear Cuenta" : "Bienvenido de Vuelta"}
            </h2>
            <p className="text-gray-600">
              {isRegister ? "Comienza tu experiencia educativa" : "Ingresa a tu cuenta para continuar"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-200"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={onEmail}
                  type="email"
                  required
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-200"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={onPassword}
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Selector de Rol (solo en registro) */}
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Tipo de Cuenta
                </label>
                <div className="relative">
                  <select 
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none transition-all duration-200"
                    value={role} 
                    onChange={onRole}
                  >
                    <option value="student">Estudiante</option>
                    <option value="teacher">Docente</option>
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {role === "student" ? (
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Users className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de Error */}
            {err && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{err}</p>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRegister ? "Creando cuenta..." : "Iniciando sesión..."}
                </>
              ) : (
                <>
                  {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
                </>
              )}
            </button>

            {/* Cambiar entre Login/Registro */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                onClick={() => setIsRegister((x) => !x)}
              >
                {isRegister 
                  ? "¿Ya tienes cuenta? Inicia sesión" 
                  : "¿No tienes cuenta? Regístrate"
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 PBL Classroom. Educación impulsada por IA.
          </p>
        </div>
      </div>
    </div>
  );
}