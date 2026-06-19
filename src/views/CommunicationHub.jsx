import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, CheckCircle2, AlertCircle, History, Smartphone, Mail, ShieldCheck, Loader2, Calendar, Target, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const CommunicationHub = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'complaints'

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, complaintsRes] = await Promise.all([
                fetch(`${API_BASE}/comms/logs`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/comms/complaints`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setLogs(await logsRes.json());
            setComplaints(await complaintsRes.json());
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleResolve = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/comms/complaints/${id}/resolve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest leading-none">Accessing Encrypted Communication Streams...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-[4px] mb-3">
                        <Smartphone size={14} /> Omni-Channel Communication Hub
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Interaction Master</h1>
                    <p className="text-slate-500 font-medium mt-3">Monitor automated alerts and manage staff feedback protocols</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Alert Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('complaints')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'complaints' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Staff Feedback ({complaints.filter(c => c.status === 'OPEN').length})
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Alerts Dispatched', value: logs.length, color: 'text-slate-900', icon: Send },
                    { label: 'Unresolved Complaints', value: complaints.filter(c => c.status === 'OPEN').length, color: 'text-rose-500', icon: AlertCircle },
                    { label: 'Average Response', value: '< 2 Hours', color: 'text-emerald-500', icon: Target },
                    { label: 'System Uptime', value: '100%', color: 'text-primary', icon: ShieldCheck }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-slate-50 ${s.color}`}>
                                <s.icon size={16} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h4 className={`text-3xl font-black font-outfit ${s.color}`}>{s.value}</h4>
                    </div>
                ))}
            </div>

            {activeTab === 'logs' ? (
                <div className="glass-card bg-white sophisticated-shadow border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">Communication Audit Trail</h3>
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <History size={14} /> Encrypted Real-Time Feed
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {logs.map((log) => (
                            <div key={log.id} className="p-8 hover:bg-slate-50/50 transition-colors flex items-start justify-between">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        {log.type === 'WHATSAPP' ? <MessageSquare size={20} /> : <Mail size={20} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-slate-900">{log.recipient}</p>
                                            <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black uppercase tracking-widest rounded text-slate-400">{log.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium max-w-2xl">{log.body}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                    <CheckCircle2 size={12} /> Successfully Dispatched
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {complaints.map((c) => (
                        <div key={c.id} className={`glass-card p-10 bg-white sophisticated-shadow border-slate-200 relative overflow-hidden transition-all ${c.status === 'RESOLVED' ? 'opacity-60 saturate-50' : 'hover:scale-[1.01] border-rose-100'}`}>
                            {c.status === 'OPEN' && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl -mr-12 -mt-12" />}
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200 uppercase">
                                        {c.staff.firstName[0]}{c.staff.lastName[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 leading-none">{c.staff.firstName} {c.staff.lastName}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{c.staff.role}</p>
                                    </div>
                                </div>
                                {c.status === 'RESOLVED' ? (
                                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Protocol Resolved
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-widest">
                                        <AlertCircle size={14} /> Attention Required
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 mb-8 italic text-slate-600 font-medium leading-relaxed">
                                "{c.message}"
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Incident Date</p>
                                        <p className="text-[11px] font-bold text-slate-900">{new Date(c.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {c.status === 'OPEN' && (
                                    <button 
                                        onClick={() => handleResolve(c.id)}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
                                    >
                                        Authorize Resolution
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {complaints.length === 0 && (
                        <div className="lg:col-span-2 py-32 text-center glass-card bg-slate-50/50 border-dashed border-2 border-slate-200">
                             <MessageSquare className="mx-auto text-slate-200 mb-6" size={64} strokeWidth={1} />
                             <p className="text-slate-400 font-black uppercase tracking-widest">Zero Personnel Feedback Incidents Recorded</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunicationHub;
