import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2, Calendar, User, CreditCard, Building2, ShieldAlert } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const DocumentVerification = () => {
    const { token } = useAuth();
    const [id, setId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!id) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE}/system/verify/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setResult(data);
            } else {
                setError(data.message || 'Verification Failed');
            }
        } catch (err) {
            setError('System connection failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[4px]">
                    <ShieldCheck size={14} /> Security Protocol
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Master Verification Hub</h1>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">Cross-reference cryptographic document fingerprints against the master ledger to ensure fiscal absolute authenticity.</p>
            </header>

            <div className="glass-card p-12 bg-white sophisticated-shadow border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                
                <form onSubmit={handleVerify} className="relative z-10 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input 
                            value={id}
                            onChange={(e) => setId(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-6 text-xl font-black placeholder:text-slate-300 placeholder:font-bold outline-none focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all font-outfit uppercase tracking-wider"
                            placeholder="ENTER 12-CHAR SECURITY ID (E.G. A5B2...)"
                            maxLength={12}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !id}
                        className="px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase text-sm tracking-[2px] transition-all hover:bg-primary shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        Execute Verification
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-10 rounded-[32px] bg-rose-50 border-2 border-rose-100 flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 shrink-0">
                        <XCircle size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">Document Compromised</h4>
                        <p className="text-rose-600 font-bold uppercase text-xs tracking-widest mt-1">Verification Status: UNAUTHORIZED / NOT FOUND</p>
                        <p className="text-slate-500 font-medium mt-3 leading-relaxed">The provided Security ID does not exist in the master ledger. This document may be fraudulent or a legacy version without cryptographic signing.</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="relative animate-in zoom-in-95 duration-500">
                    <div className="p-10 rounded-[32px] bg-emerald-50 border-2 border-emerald-100 flex items-center gap-8 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 shrink-0">
                            <CheckCircle2 size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-900">Authenticity Verified</h4>
                            <p className="text-emerald-600 font-bold uppercase text-xs tracking-widest mt-1">Verification Status: SECURE / LEDGER SYNCED</p>
                        </div>
                    </div>

                    <div className="glass-card p-12 bg-white sophisticated-shadow border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Building2 size={12} /> Document Type</p>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{result.type.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CreditCard size={12} /> Monetary Value</p>
                                <p className="text-3xl font-black text-primary font-outfit">₦{result.amount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12} /> Entity Responsible</p>
                                <p className="text-lg font-black text-slate-900">{result.studentName || result.staffName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Finalization Date</p>
                                <p className="text-lg font-bold text-slate-700">{new Date(result.date).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Cloud ID: {result.documentId}</p>
                            </div>
                            <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-primary transition-colors">
                                <ShieldAlert size={14} /> Log Verification Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVerification;
