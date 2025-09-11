import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import useAuth from "../auth/useAuth";
import dayjs from "dayjs";

function toISOLocal(local) {
  if (!local) return null;
  return dayjs(local).toISOString();
}

export default function AssetDetailPage(){
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ start_time: "", end_time: "", purpose: "" });
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    load();
  }, [id]);

  async function load(){
    try {
      const a = await axios.get(`/assets/${id}`);
      setAsset(a.data);
      const r = await axios.get(`/reservations/asset/${id}`);
      setReservations(r.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function submit(e){
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        asset_id: Number(id),
        user_name: user?.username || "guest",
        start_time: toISOLocal(form.start_time),
        end_time: toISOLocal(form.end_time),
        purpose: form.purpose
      };
      await axios.post("/reservations/", payload);
      setForm({ start_time: "", end_time: "", purpose: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed");
    }
  }

  return (
    <div>
      {!asset ? <div>Loading…</div> : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{asset.name}</h2>
            <div className="text-sm text-slate-600">{asset.ip_address}</div>
            <p className="mt-2 text-slate-700">{asset.description}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Reservations</h3>
            <ul className="space-y-2">
              {reservations.map(r => (
                <li key={r.id} className="border p-2 rounded">
                  <div className="flex justify-between">
                    <div><strong>{r.user_name === user?.username ? r.user_name : (r.user_name === '***' ? 'Booked' : 'Booked')}</strong></div>
                    <div className="text-sm text-slate-500">{r.status}</div>
                  </div>
                  <div className="text-sm text-slate-600">{new Date(r.start_time).toLocaleString()} — {new Date(r.end_time).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Reserve</h3>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={submit} className="grid grid-cols-1 gap-2">
              {!user && <input className="border rounded px-3 py-2" placeholder="Your name" onChange={e => {}} />}
              <label className="text-sm">Start</label>
              <input type="datetime-local" className="border rounded px-3 py-2" value={form.start_time} onChange={e => setForm({...form,start_time:e.target.value})} />
              <label className="text-sm">End</label>
              <input type="datetime-local" className="border rounded px-3 py-2" value={form.end_time} onChange={e => setForm({...form,end_time:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Purpose (optional)" value={form.purpose} onChange={e => setForm({...form,purpose:e.target.value})} />
              <div className="flex justify-end">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Reserve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
