import { useState } from 'react';
import { HelpCircle, Send, Plus, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SupportRequest = () => {
    const { token } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({ subject: '', message: '', priority: 'NORMAL' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/support`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSuccess(true);
                setFormData({ subject: '', message: '', priority: 'NORMAL' });
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                    <HelpCircle size={40} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technical Governance Support</h1>
                <p className="text-slate-500 font-medium mt-2">Request assistance from the platform ecosystem core</p>
            </header>

            <div className="bg-white rounded-[40px] p-12 sophisticated-shadow border border-slate-100 overflow-hidden relative">
                {success && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Transmission Successful</h2>
                        <p className="text-slate-500 font-medium max-w-sm mb-10">Your assistance request has been queued in the ecosystem core. A platform administrator will review your node shortly.</p>
                        <button onClick={() => setSuccess(false)} className="px-12 py-4 bg-slate-900 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Send Another Request</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Subject</label>
                            <input 
                                required
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                placeholder="Brief summary of the issue"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criticality Level</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                            >
                                <option value="LOW">LOW - Non-urgent inquiry</option>
                                <option value="NORMAL">NORMAL - Standard update</option>
                                <option value="HIGH">HIGH - System interference</option>
                                <option value="URGENT">URGENT - Direct operational block</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Explanation</label>
                        <textarea 
                            required
                            rows={8}
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            placeholder="Please provide full technical context for the assistance request..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button disabled={isSaving} className="w-full py-6 bg-primary-600 rounded-[24px] text-white font-black uppercase text-sm tracking-[2px] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-4 active:scale-95 glow-button">
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Broadcast Help Request
                        </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                            Safety Protocol: Urgent requests should only be used for system-wide outages or confirmed data anomalies. All transmissions are audited.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupportRequest;
