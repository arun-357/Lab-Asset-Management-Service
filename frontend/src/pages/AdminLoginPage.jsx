import React, { useState, useEffect } from "react";
import useAuth from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage(){
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (user && user.roles?.includes("admin")) {
      nav("/dashboard");
    }
  }, [user, nav]);

  async function submit(e){
    e.preventDefault();
    setErr(null);
    try {
      await login(form.username, form.password);
      if (!localStorage.getItem("access_token")) return; // safety
      const token = localStorage.getItem("access_token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.scopes?.includes("admin")) {
        nav("/dashboard");
      } else {
        setErr("User is not an admin");
      }
    } catch (e){
      setErr(e.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow border border-slate-200">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">Admin Access</h1>
      <p className="text-sm text-slate-600 mb-4">Sign in with an account that has admin privileges.</p>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 font-medium">Login as Admin</button>
      </form>
    </div>
  );
}
