import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';

const ActivityLog = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`${API_BASE}/payment/activity?limit=50`)
            .then(res => res.json())
            .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-40 text-center flex flex-col items-center gap-6 animate-pulse">
            <Loader2 size={64} className="text-primary-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-500">Decrypting Transaction Flow...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Audit Flux</h1>
                <p className="text-slate-500 font-medium mt-2">Chronological data stream of institutional financial interactions</p>
            </header>

            <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {['Recipient Node', 'Fiscal Payload', 'Ref Signature', 'Temporal Mark', 'Status'].map(col => (
                                <th key={col} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {payments.map((p, i) => {
                            const student = p.feeRecord?.student;
                            return (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black border border-primary/10 transition-all group-hover:bg-primary group-hover:text-white">
                                                {student?.firstName[0]}{student?.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student?.firstName} {student?.lastName}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{student?.classModel?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-emerald-600 tracking-tight">₦{p.amount.toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.paymentMethod}</p>
                                        <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-tighter">{p.reference || 'CORE-PROTO'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                         <p className="text-xs font-bold text-slate-900">{new Date(p.paymentDate).toLocaleDateString()}</p>
                                         <p className="text-[9px] text-slate-400 font-black mt-1 uppercase">{new Date(p.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            <CheckCircle2 size={12} /> Confirmed
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLog;
