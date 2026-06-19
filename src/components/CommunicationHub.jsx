import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, User, CheckCircle2, AlertCircle, Phone, Search, X, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const CommunicationHub = ({ schoolId }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = () => {
        setLoading(true);
        fetch(`${API_BASE}/payroll/complaints`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setComplaints(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    useEffect(() => fetchComplaints(), [schoolId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[4px] mb-2">
                        <MessageSquare size={14} /> Personnel Feedback Loop
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Communication Hub</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage incoming WhatsApp complaints and resolution tickets</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Complaints', value: complaints.filter(c => c.status === 'OPEN').length, color: 'text-rose-500' },
                    { label: 'Resolved Tickets', value: complaints.filter(c => c.status === 'RESOLVED').length, color: 'text-emerald-500' },
                    { label: 'Total Feedback Volume', value: complaints.length, color: 'text-slate-900' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <h4 className={`text-3xl font-black font-['Outfit'] ${s.color}`}>{s.value}</h4>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-xl text-slate-900">Incoming Feed</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" className="bg-white border border-slate-200 rounded-xl pl-11 pr-6 py-3 text-xs font-medium w-64 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-outfit" placeholder="Filter messages..." />
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {complaints.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No Active Personnel Complaints Detected</div>
                    ) : (
                        complaints.map((c) => (
                            <div key={c.id} className="p-8 hover:bg-slate-50/50 transition-all flex gap-8 group">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                    <MessageCircle size={24} className="text-primary-500" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <p className="text-md font-black text-slate-900">{c.staff.firstName} {c.staff.lastName}</p>
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">{c.staff.role}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={12} /> {c.staff.phone}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 relative group-hover:bg-white group-hover:border-primary/10 transition-all shadow-sm">
                                        <p className="text-slate-600 font-medium leading-relaxed italic">"{c.message}"</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-3">
                                            {c.status === 'OPEN' ? (
                                                <button className="px-6 py-2 bg-emerald-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10">Resolve Ticket</button>
                                            ) : (
                                                <span className="px-6 py-2 bg-slate-100 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Archived Resolve</span>
                                            )}
                                            <button className="px-6 py-2 bg-slate-900 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                                                <Share2 size={12} /> Respond via WhatsApp
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ticket ID: {c.id}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const Share2 = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>

export default CommunicationHub;
