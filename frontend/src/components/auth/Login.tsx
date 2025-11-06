import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/authService";
import { BookOpen, Eye, EyeOff } from "lucide-react";


type Role = "teacher" | "student";

// Estilos CSS como fallback
const styles = {
  container: "min-h-screen bg-white flex items-center justify-center p-4",
  card: "w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-6",
  header: "text-center mb-6",
  logo: "w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4",
  title: "text-2xl font-semibold text-gray-900 mb-2",
  subtitle: "text-gray-600 text-sm",
  formTitle: "text-lg font-semibold text-gray-900 text-center mb-2",
  formSubtitle: "text-gray-600 text-sm text-center mb-6",
  inputContainer: "mb-4",
  label: "block text-sm font-medium text-gray-700 mb-2",
  input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  inputWithIcon: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10",
  iconButton: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
  select: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  error: "bg-red-50 border border-red-200 rounded-lg p-3 mb-4",
  errorText: "text-red-700 text-sm",
  button: "w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium",
  toggle: "text-center mt-4 text-sm text-gray-600 hover:text-gray-900 cursor-pointer",
  footer: "text-center mt-6 text-xs text-gray-500"
};

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
    <div className={styles.container}>
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className={styles.title}>PBL Classroom</h1>
          <p className={styles.subtitle}>Aprendizaje Basado en Problemas con IA</p>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <h2 className={styles.formTitle}>
            {isRegister ? "Crear Cuenta" : "Bienvenido de Vuelta"}
          </h2>
          <p className={styles.formSubtitle}>
            {isRegister ? "Comienza tu experiencia educativa" : "Ingresa a tu cuenta para continuar"}
          </p>

          <form onSubmit={submit}>
            {/* Email */}
            <div className={styles.inputContainer}>
              <label className={styles.label}>Correo Electrónico</label>
              <input
                className={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            {/* Password */}
            <div className={styles.inputContainer}>
              <label className={styles.label}>Contraseña</label>
              <div className="relative">
                <input
                  className={styles.inputWithIcon}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.iconButton}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Select */}
            {isRegister && (
              <div className={styles.inputContainer}>
                <label className={styles.label}>Tipo de Cuenta</label>
                <select 
                  className={styles.select}
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
              <div className={styles.error}>
                <p className={styles.errorText}>{err}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              className={styles.button}
              type="submit"
            >
              {loading ? "Cargando..." : (isRegister ? "Crear Cuenta" : "Iniciar Sesión")}
            </button>

            {/* Toggle Login/Register */}
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setIsRegister((x) => !x)}
            >
              {isRegister 
                ? "¿Ya tienes cuenta? Inicia sesión" 
                : "¿No tienes cuenta? Regístrate"
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>© 2024 PBL Classroom. Educación impulsada por IA.</p>
        </div>
      </div>
    </div>
  );
}