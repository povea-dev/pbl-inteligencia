import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/authService";
import { BookOpen, Eye, EyeOff } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-white grid place-items-center p-6">
      <div className="w-full max-w-sm">
        {/* Header Simple */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            PBL Classroom
          </h1>
          <p className="text-gray-600 text-sm">
            Aprendizaje Basado en Problemas con IA
          </p>
        </div>

        {/* Card Simple */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRegister ? "Crear Cuenta" : "Bienvenido de Vuelta"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isRegister ? "Comienza tu experiencia educativa" : "Ingresa a tu cuenta para continuar"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Select */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cuenta
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  value={role} 
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                </select>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{err}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition-colors font-medium"
            >
              {loading ? "Cargando..." : (isRegister ? "Crear Cuenta" : "Iniciar Sesión")}
            </button>

            {/* Toggle Login/Register */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
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

        {/* Footer Simple */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 PBL Classroom. Educación impulsada por IA.
          </p>
        </div>
      </div>
    </div>
  );
}