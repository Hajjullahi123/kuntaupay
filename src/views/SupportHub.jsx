import { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Clock, CheckCircle2, AlertCircle, Shield, Building, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SupportHub = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetch(`${API_BASE}/super-admin/support/tickets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setTickets(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE}/super-admin/support/tickets/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
            }
        } catch (err) { alert(err.message); }
    };

    const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <HelpCircle className="text-primary-600" size={32} />
                        Ecosystem Support Hub
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Manage institutional assistance requests across all nodes</p>
                </div>
                
                <div className="flex bg-white rounded-2xl border border-slate-100 p-1.5 sophisticated-shadow">
                    {['ALL', 'OPEN', 'RESOLVED'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="p-20 text-center font-black uppercase text-slate-300 animate-pulse">Synchronizing Support Stream...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="bg-white p-20 rounded-[40px] text-center border border-slate-100">
                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">Support Queue Clear</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">All institutional nodes are operational and assistance-free</p>
                    </div>
                ) : filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-[32px] p-8 border border-slate-100 sophisticated-shadow hover:border-primary/30 transition-all group relative overflow-hidden">
                        {ticket.priority === 'URGENT' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
                        
                        <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                        ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                        ticket.priority === 'URGENT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                        {ticket.priority} PRIORITY
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900">{ticket.subject}</h3>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed">{ticket.message}</p>
                                
                                <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Building size={14} /> {ticket.school?.name}</span>
                                    <span className="flex items-center gap-2"><User size={14} /> {ticket.user?.firstName} {ticket.user?.lastName}</span>
                                    <span className="flex items-center gap-2"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {ticket.status === 'OPEN' ? (
                                    <button 
                                        onClick={() => updateStatus(ticket.id, 'RESOLVED')}
                                        className="px-8 py-4 bg-emerald-600 rounded-2xl text-white font-black uppercase text-[11px] tracking-[2px] hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/10"
                                    >
                                        <CheckCircle2 size={18} /> Mark Resolved
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => updateStatus(ticket.id, 'OPEN')}
                                        className="px-8 py-4 bg-slate-900 rounded-2xl text-white font-black uppercase text-[11px] tracking-[2px] hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10"
                                    >
                                        <RotateCcw size={18} /> Reopen Ticket
                                    </button>
                                )}
                                <button className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-primary transition-colors">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RotateCcw = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

export default SupportHub;
