import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export function LoginModal({ open, onClose, onSuccess, login }) {
  if (!open) return null;
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState(null);
  async function submit(e){
    e.preventDefault();
    setErr(null);
    try {
      await login(form.username, form.password);
      onSuccess?.();
      onClose();
    } catch (error){
      setErr(error.response?.data?.detail || "Login failed");
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Login</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 font-medium">Login</button>
        </form>
      </div>
    </div>
  );
}

export default function Header({ onOpenLogin }){
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="backdrop-blur bg-white/70 supports-[backdrop-filter]:bg-white/40 shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Lab Asset Manager</Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-slate-600 hover:text-slate-900">Assets</Link>
          {user && user.roles?.includes("admin") && (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link to="/users" className="text-slate-600 hover:text-slate-900">Users</Link>
            </>
          )}
          {user ? (
            <>
              <span className="text-sm text-slate-700">{user.username}</span>
              <button onClick={() => { logout(); nav("/login"); }} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <button onClick={onOpenLogin} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">Login</button>
              <Link to="/admin-login" className="text-sm text-slate-600 hover:text-slate-900">Admin Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
