import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import useAuth from "../auth/useAuth";

export default function UsersPage(){
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState(null);
  const { user } = useAuth();

  async function load(){
    try {
      const r = await axios.get("/users/");
      setUsers(r.data);
    } catch (e){ console.error(e); }
  }
  useEffect(()=> { load(); }, []);

  async function createUser(e){
    e.preventDefault();
    setError(null);
    try {
      await axios.post("/users/", form);
      setForm({ username: "", email: "", password: "", role: "user" });
      setCreating(false);
      load();
    } catch (e){ setError(e.response?.data?.detail || "Failed"); }
  }

  async function toggleAdmin(u){
    const newRole = u.role === "admin" ? "user" : "admin";
    await axios.patch(`/users/${u.username}`, { role: newRole });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Users (Admin)</h2>
        <button onClick={()=>setCreating(c=>!c)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">{creating ? 'Close' : 'Add User'}</button>
      </div>
      {creating && (
        <form onSubmit={createUser} className="grid gap-3 bg-white/70 backdrop-blur-sm p-5 rounded-xl ring-1 ring-slate-200 shadow">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <input className="border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
            <input className="border rounded px-3 py-2" placeholder="Email (optional)" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <input type="password" className="border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          <select className="border rounded px-3 py-2" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex justify-end">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map(u => (
          <div key={u.id} className="group relative rounded-2xl p-4 bg-white/70 backdrop-blur-sm ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-800">{u.username}</div>
                <div className="text-xs text-slate-500">{u.email || '—'}</div>
              </div>
              {user?.username !== u.username && (
                <button onClick={()=>toggleAdmin(u)} className="text-[11px] uppercase tracking-wide font-medium bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 px-2 py-1 rounded transition">{u.role === 'admin' ? 'Revoke' : 'Make Admin'}</button>
              )}
            </div>
            <div className="mt-3 text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-600 inline-block">{u.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
