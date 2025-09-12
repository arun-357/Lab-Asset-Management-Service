import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";
import axios from "../api/axios";

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

export function RegisterBootstrapModal({ open, onClose, onSuccess }){
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [err,setErr] = useState(null);
  const [info,setInfo] = useState(null);
  const firstFieldRef = useRef(null);
  useEffect(()=>{ if(open){ setErr(null); setInfo("Create the very first administrator account."); setTimeout(()=>firstFieldRef.current?.focus(),50);} },[open]);
  useEffect(()=>{
    if(open){
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  },[open]);
  if(!open) return null;
  const portalRoot = document.getElementById('modal-root') || document.body;
  async function submit(e){
    e.preventDefault();
    setErr(null);
    try {
      await axios.post('/auth/register', form);
      setInfo("Registered successfully. Use Login to start managing assets.");
      onSuccess?.();
    } catch (error){
      setErr(error.response?.data?.detail || 'Registration failed');
    }
  }
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="bootstrap-admin-title" className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-5 border border-slate-200 animate-fadeIn">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 id="bootstrap-admin-title" className="text-xl font-semibold tracking-tight">Bootstrap Administrator</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">This action occurs only once. Afterwards registration produces normal users unless performed via the Users page.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        {info && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">{info}</div>}
        {err && <div className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Username</label>
            <input ref={firstFieldRef} required className="w-full border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded px-3 py-2 text-sm" placeholder="admin" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Email (optional)</label>
            <input className="w-full border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded px-3 py-2 text-sm" placeholder="admin@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input required type="password" className="w-full border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded px-3 py-2 text-sm" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            </div>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-md py-2.5 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Create Admin</button>
          <p className="text-[10px] text-slate-400 text-center">After this, use the Login button in the header. You can add more admins later via Users.</p>
        </form>
      </div>
    </div>,
    portalRoot
  );
}

export default function Header({ onOpenLogin }){
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [bootstrapNeeded, setBootstrapNeeded] = useState(false);
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);
  useEffect(()=>{
    async function check(){
      try {
        const r = await axios.get('/auth/bootstrap-status');
        if(r.data.empty){
          setBootstrapNeeded(true);
          setBootstrapOpen(true);
        }
      } catch(e){ /* ignore */ }
      finally { setCheckingBootstrap(false); }
    }
    check();
  },[]);
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
            location.pathname === '/admin-login' ? null : (
              <div className="flex items-center gap-2">
                {!checkingBootstrap && bootstrapNeeded && (
                  <button onClick={()=>setBootstrapOpen(true)} className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-400">Bootstrap Admin</button>
                )}
                <button onClick={onOpenLogin} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">Login</button>
              </div>
            )
          )}
        </nav>
      </div>
      <RegisterBootstrapModal open={bootstrapOpen && !user} onClose={()=>setBootstrapOpen(false)} onSuccess={()=>{ /* keep open to show success message; user can close manually */ }} />
    </header>
  );
}
