import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function LoginPage(){
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setErr(null);
    try {
      await login(form.username, form.password);
      nav("/");
    } catch (error) {
      setErr(error.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={e => setForm({...form,username:e.target.value})} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">Login</button>
        </div>
      </form>
    </div>
  );
}
