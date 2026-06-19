import { Shield, Clock, User, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const AuditLogs = ({ schoolId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/payment/audit-logs`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [schoolId]);

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">Decrypting Audit Trail...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <div className="flex items-center gap-3 text-xs font-black text-primary-500 uppercase tracking-[4px] mb-2">
                    <Shield size={14} /> System Integrity Protocol
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Audit History</h1>
                <p className="text-slate-500 font-medium mt-2">Historical log of all financial interactions and record modifications</p>
            </header>

            <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contextual Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <Clock size={14} className="text-slate-300" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                      log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                      log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                      'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                      {log.action}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.resource}</td>
                                <td className="px-8 py-6">
                                    <pre className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg font-mono truncate max-w-xs">{log.details || 'N/A'}</pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
