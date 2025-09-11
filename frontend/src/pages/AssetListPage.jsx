import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function AssetListPage(){
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", ip_address: "", description: "" });
  const [createErr, setCreateErr] = useState(null);
  const { user } = useAuth();

  useEffect(()=> { fetchAssets(); }, []);

  async function fetchAssets(){
    setLoading(true);
    try {
      const res = await axios.get("/assets/");
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createAsset(e){
    e.preventDefault();
    setCreateErr(null);
    try {
      await axios.post('/assets/', newAsset);
      setNewAsset({ name: '', ip_address: '', description: '' });
      setCreating(false);
      fetchAssets();
    } catch (err){
      setCreateErr(err.response?.data?.detail || 'Failed');
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Assets</h1>
        {user && user.roles?.includes("admin") && (
          <button
            onClick={()=>setCreating(c=>!c)}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            {creating ? 'Close' : 'Add Asset'}
          </button>
        )}
      </div>
      {creating && user && user.roles?.includes('admin') && (
        <form onSubmit={createAsset} className="mb-8 grid gap-3 bg-white/70 backdrop-blur-sm p-5 rounded-xl ring-1 ring-slate-200 shadow">
          {createErr && <div className="text-sm text-red-600">{createErr}</div>}
          <input className="border rounded px-3 py-2" placeholder="Name" value={newAsset.name} onChange={e=>setNewAsset({...newAsset,name:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="IP Address" value={newAsset.ip_address} onChange={e=>setNewAsset({...newAsset,ip_address:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Description" value={newAsset.description} onChange={e=>setNewAsset({...newAsset,description:e.target.value})} />
          <div className="flex justify-end">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      )}
      {!user && (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 bg-white/60 backdrop-blur-sm">
          <p className="text-lg">Please log in to view assets.</p>
        </div>
      )}
      {user && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? <div>Loading…</div> : assets.map(a => (
            <Link to={`/assets/${a.id}`} key={a.id} className="group relative rounded-2xl p-5 bg-white/70 backdrop-blur-sm ring-1 ring-slate-200 hover:ring-indigo-300 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition">{a.name}</h3>
                <span className="text-[11px] uppercase tracking-wide font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{a.ip_address}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3 min-h-[48px]">{a.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                 <span className="opacity-0 group-hover:opacity-100 transition">View →</span>
               </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
