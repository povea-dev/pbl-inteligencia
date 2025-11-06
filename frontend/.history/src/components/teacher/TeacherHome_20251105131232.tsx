import { useEffect, useState } from "react";
import { createCourse, listMyCourses } from "../../services/coursesService";
import type { AppUser, Course } from "../../types";
import { Link } from "react-router-dom";

export default function TeacherHome({ user }: { user: AppUser }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await listMyCourses(user.uid);
      if (mounted) setCourses(data);
    })();
    return () => {
      mounted = false;
    };
  }, [user.uid]);

  async function create(): Promise<void> {
    await createCourse(name, desc, user.uid); // ← quitamos 'id' no usado
    const data = await listMyCourses(user.uid);
    setCourses(data);
    setName("");
    setDesc("");
  }

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setName(e.target.value);
  }

  function onDescChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDesc(e.target.value);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mis cursos</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Nombre"
          value={name}
          onChange={onNameChange}
        />
        <input
          className="border p-2 rounded"
          placeholder="Descripción"
          value={desc}
          onChange={onDescChange}
        />
        <button
          onClick={create}
          className="rounded bg-black text-white px-4 disabled:opacity-60"
          disabled={!name.trim()}
        >
          Crear
        </button>
      </div>

      <ul className="space-y-2">
        {courses.map((c) => (
          <li key={c.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500">{c.description}</div>
            </div>
            <Link to={`/course/${c.id}/chat`} className="underline">
              Abrir chatbot
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
