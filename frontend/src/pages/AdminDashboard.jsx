import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import useAuth from '../auth/useAuth';

export default function AdminDashboard(){
  const { user } = useAuth();
  const [summary,setSummary] = useState(null);
  const [error,setError] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    let active = true;
    async function load(){
      if(!user || !user.roles?.includes('admin')) return;
      try {
        setLoading(true);
        const r = await axios.get('/admin/summary');
        if(active) setSummary(r.data);
      } catch(err){
        if(active) setError(err.response?.data?.detail || 'Failed to load');
      } finally {
        if(active) setLoading(false);
      }
    }
    load();
    return ()=>{active=false};
  },[user]);

  if(!user || !user.roles?.includes('admin')){
    return <div className='p-6'>Not authorized.</div>;
  }

  function labelize(key){
    return key
      .replace(/_/g,' ')
      .replace(/\b\w/g, c=>c.toUpperCase());
  }

  function flattenMetrics(obj, prefix = ''){
    const rows = [];
    for (const [k,v] of Object.entries(obj)){
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        rows.push(...flattenMetrics(v, prefix ? `${prefix} ${labelize(k)}` : labelize(k)));
      } else {
        rows.push({ key: prefix ? `${prefix} ${labelize(k)}` : labelize(k), value: v });
      }
    }
    return rows;
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-slate-800'>Dashboard</h1>
        <p className='text-slate-500 mt-1 text-sm'>System metrics.</p>
      </div>

      {loading && <div className='text-slate-500 text-sm'>Loading metrics...</div>}
      {error && <div className='text-red-600 text-sm'>{error}</div>}

      {summary && (
        <div className='overflow-x-auto rounded border border-slate-200 bg-white shadow-sm'>
          {(() => {
            const order = ['users','assets','reservations','generated_at'];
            const ordered = {};
            for (const k of order) if (summary[k] !== undefined) ordered[k] = summary[k];
            const rows = flattenMetrics(ordered);
            return (
              <table className='min-w-full text-sm'>
                <thead className='bg-slate-50 text-slate-600 text-xs uppercase tracking-wide'>
                  <tr>
                    <th className='text-left px-4 py-2 font-medium'>Metric</th>
                    <th className='text-left px-4 py-2 font-medium'>Value</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {rows.map(r => (
                    <tr key={r.key} className='hover:bg-slate-50/70'>
                      <td className='px-4 py-2 text-slate-700'>{r.key}</td>
                      <td className='px-4 py-2 font-mono text-slate-900'>{String(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}
    </div>
  );
}
