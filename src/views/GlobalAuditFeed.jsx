import { useState, useEffect } from 'react';
import { Shield, Search, Filter, ArrowLeft, ArrowRight, Activity, Clock, User, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const GlobalAuditFeed = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/super-admin/audit-logs?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setLogs(data.logs || []);
            setPages(data.pages || 1);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [token, page]);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase()) ||
        log.school?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Shield className="text-primary-600" size={32} />
                        Universal Audit Matrix
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Global chronological ledger of ecosystem modifications</p>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors" size={18} />
                    <input 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Scan audit signatures..." 
                        className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none w-full md:w-80"
                    />
                </div>
            </header>

            {/* Audit Stream */}
            <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-emerald-500" size={20} />
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Stream</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-30"><ArrowLeft size={18} /></button>
                        <span className="text-xs font-black text-slate-500">MATRIX PAGE {page} / {pages}</span>
                        <button disabled={page === pages} onClick={() => setPage(page+1)} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-30"><ArrowRight size={18} /></button>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-20 text-center font-black uppercase text-slate-300 animate-pulse">Decrypting Audit Logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-20 text-center font-black uppercase text-slate-300">No anomalies detected</div>
                    ) : filteredLogs.map((log) => (
                        <div key={log.id} className="p-8 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                        {log.resource}
                                    </span>
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                        log.action.includes('DELETED') || log.action.includes('DECOMMISSION') 
                                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {log.action}
                                    </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-900 leading-tight">{log.details || 'System configuration change initiated'}</h4>
                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Building size={14} className="text-slate-300" /> {log.school?.name}</span>
                                    <span className="flex items-center gap-2"><Clock size={14} className="text-slate-300" /> {new Date(log.createdAt).toLocaleString()}</span>
                                    <span className="flex items-center gap-2"><User size={14} className="text-slate-300" /> UID: {log.userId || 'SYSTEM'}</span>
                                </div>
                            </div>
                            <button className="px-5 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white transition-all">
                                Inspect Node
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalAuditFeed;
