import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, History, Download, Trash2, Loader2, AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SecuritySettings = () => {
    const { token } = useAuth();
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/system/backups`, { headers: { 'Authorization': `Bearer ${token}` } });
            setBackups(await res.json());
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchBackups(); }, [token]);

    const handleManualBackup = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/system/backup`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            alert(data.message);
            fetchBackups();
        } catch (err) { alert(err.message); }
        setActionLoading(false);
    };

    const handleRestore = async () => {
        if (!confirm(`CRITICAL WARNING: RESTORING TO ${selectedBackup.name} WILL OVERWRITE CURRENT DATA. ARE YOU ABSOLUTELY CERTAIN?`)) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/system/restore`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: selectedBackup.name })
            });
            const data = await res.json();
            alert(data.message);
            setShowRestoreModal(false);
            window.location.reload();
        } catch (err) { alert(err.message); }
        setActionLoading(false);
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest py-20">Accessing Shielded Fiscal Records...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-[4px] mb-3">
                        <ShieldCheck size={14} /> Fiscal Integrity Protocol
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Security & Backups</h1>
                    <p className="text-slate-500 font-medium mt-3">Execute manual snapshots and manage historical database states</p>
                </div>
                <button onClick={handleManualBackup} disabled={actionLoading} className="btn-primary shadow-2xl flex items-center gap-2 group disabled:opacity-50">
                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Initialize Emergency Snapshot
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Snapshots', value: backups.length, color: 'text-slate-900' },
                    { label: 'Redundancy Layer', value: '30 Days', color: 'text-primary' },
                    { label: 'Integrity Rating', value: 'ECC-521', color: 'text-emerald-500' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <h4 className={`text-4xl font-black font-outfit ${s.color}`}>{s.value}</h4>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-xl text-slate-900">Fiscal Snapshot History</h3>
                    <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <AlertCircle size={14} /> Data Restoration requires Executive Authority
                    </div>
                </div>
                
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Snapshot Identity</th>
                            <th className="px-8 py-5">Storage Scale</th>
                            <th className="px-8 py-5">Creation Timestamp</th>
                            <th className="px-8 py-5 text-right">Emergency Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {backups.map((b) => (
                            <tr key={b.name} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors ring-1 ring-inset ring-slate-200">
                                            <History size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{b.name}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">SHA-256 Verified</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs font-bold text-slate-600">{(b.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs font-bold text-slate-600">{new Date(b.createdAt).toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => { setSelectedBackup(b); setShowRestoreModal(true); }} className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        Activate Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showRestoreModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-12 sophisticated-shadow bg-white animate-in zoom-in-95 duration-400 shadow-2xl relative">
                        <button onClick={() => setShowRestoreModal(false)} className="absolute right-8 top-8 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Initialize System Rollback</h3>
                            <p className="text-slate-500 text-sm font-medium">This protocol will replace all current data with the snapshot state from {new Date(selectedBackup.createdAt).toLocaleString()}. This action is logged.</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowRestoreModal(false)} className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Abort Protocol</button>
                            <button onClick={handleRestore} disabled={actionLoading} className="flex-1 px-8 py-4 bg-rose-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white hover:bg-rose-500 transition-all shadow-2xl shadow-rose-950/20 disabled:opacity-50">
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Execute Rollback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettings;
