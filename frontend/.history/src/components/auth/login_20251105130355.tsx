import { useState } from "react";
import { login, register } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email,setEmail] = useState(""); const [password,setPassword]=useState("");
  const [isRegister,setIsRegister] = useState(false);
  const [role,setRole] = useState<"teacher"|"student">("student");
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setErr(""); setLoading(true);
    try{
      if(isRegister){
        await register(email,password,role);
      }else{
        await login(email,password);
      }
      nav(role==="teacher"?"/teacher":"/student",{replace:true});
    }catch(e:any){ setErr(e.message||"Error"); }
    finally{ setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl shadow p-6 bg-white">
        <h1 className="text-xl font-semibold">{isRegister?"Crear cuenta":"Iniciar sesión"}</h1>
        <input className="border p-2 w-full rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {isRegister && (
          <select className="border p-2 w-full rounded" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="student">Estudiante</option>
            <option value="teacher">Docente</option>
          </select>
        )}
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">{loading?"...":"Continuar"}</button>
        <button type="button" className="text-sm underline" onClick={()=>setIsRegister(x=>!x)}>
          {isRegister?"¿Ya tienes cuenta? Inicia sesión":"¿No tienes cuenta? Regístrate"}
        </button>
      </form>
    </div>
  );
}
