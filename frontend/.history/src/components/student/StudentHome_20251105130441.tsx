import type { AppUser } from "../../types";

// Por ahora simple; después listamos inscripciones del alumno
export default function StudentHome({user}:{user:AppUser}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Hola, {user.email}</h1>
      <p>Cuando el docente te inscriba en un curso, verás el acceso al chatbot aquí.</p>
    </div>
  );
}
