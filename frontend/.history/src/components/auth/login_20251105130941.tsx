import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "@/services/auth";

type Role = "teacher" | "student";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

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
      // Si acabas de registrarte como teacher, te mando al dashboard teacher; si no, al student.
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
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl shadow p-6 bg-white">
        <h1 className="text-xl font-semibold">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>

        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          value={email}
          onChange={onEmail}
          type="email"
          required
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={onPassword}
          required
        />

        {isRegister && (
          <select className="border p-2 w-full rounded" value={role} onChange={onRole}>
            <option value="student">Estudiante</option>
            <option value="teacher">Docente</option>
          </select>
        )}

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button disabled={loading} className="w-full rounded bg-black text-white py-2">
          {loading ? "..." : "Continuar"}
        </button>

        <button
          type="button"
          className="text-sm underline"
          onClick={() => setIsRegister((x) => !x)}
        >
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </form>
    </div>
  );
}
