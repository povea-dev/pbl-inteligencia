import { useEffect, useState } from "react";
import { createCourse, listMyCourses } from "../../services/coursesService";
import type { AppUser, Course } from "../../types";
import { Link } from "react-router-dom";

export default function TeacherHome({user}:{user:AppUser}) {
  const [courses,setCourses]=useState<Course[]>([]);
  const [name,setName]=useState(""); const [desc,setDesc]=useState("");

  useEffect(()=>{ (async()=>setCourses(await listMyCourses(user.uid)))(); },[user.uid]);

  async function create() {
    const id = await createCourse(name, desc, user.uid);
    setCourses(await listMyCourses(user.uid));
    setName(""); setDesc("");
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mis cursos</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Descripción" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button onClick={create} className="rounded bg-black text-white px-4">Crear</button>
      </div>
      <ul className="space-y-2">
        {courses.map(c=>(
          <li key={c.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500">{c.description}</div>
            </div>
            <Link to={`/course/${c.id}/chat`} className="underline">Abrir chatbot</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
