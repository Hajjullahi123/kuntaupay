import { useState, useEffect } from 'react';
import { GraduationCap, CreditCard, Activity as ActivityIcon, Plus, Loader2 } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminSetup = ({ schoolId }) => {
    const [classes, setClasses] = useState([]);
    const [fees, setFees] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [newClassName, setNewClassName] = useState('');
    const [newClassArm, setNewClassArm] = useState('');
    const [newSessionName, setNewSessionName] = useState('');
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const [cRes, fRes, sRes] = await Promise.all([
                    apiFetch(`${API_BASE}/payment/classes`, {}, schoolId),
                    apiFetch(`${API_BASE}/payment/fee-structures`, {}, schoolId),
                    apiFetch(`${API_BASE}/super-admin/academic-periods?schoolId=${schoolId}`)
                ]);
                setClasses(await cRes.json());
                setFees(await fRes.json());
                setSessions(await sRes.json());
            } catch (err) { console.error(err); }
        };
        load();
    }, [refresh, schoolId]);

    const handleAddClass = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiFetch(`${API_BASE}/payment/classes`, {
                method: 'POST',
                body: JSON.stringify({ name: newClassName, arm: newClassArm })
            }, schoolId);
            setNewClassName(''); setNewClassArm(''); setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    const handleUpdateFee = async (classId, amount) => {
        try {
            await apiFetch(`${API_BASE}/payment/fee-structures`, {
                method: 'POST',
                body: JSON.stringify({ classId, amount: parseFloat(amount) })
            }, schoolId);
            setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
    };

    const handleAddSession = async (e) => {
        e.preventDefault();
        try {
            await apiFetch(`${API_BASE}/super-admin/academic-periods/sessions`, {
                method: 'POST',
                body: JSON.stringify({ schoolId, name: newSessionName })
            });
            setNewSessionName(''); setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
    };

    const handleActivateSession = async (id) => {
        try {
            await apiFetch(`${API_BASE}/super-admin/academic-periods/sessions/${id}/activate`, {
                method: 'PATCH',
                body: JSON.stringify({ schoolId })
            });
            setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
    };

    const handleAddTerm = async (sessionId, name) => {
        try {
            await apiFetch(`${API_BASE}/super-admin/academic-periods/terms`, {
                method: 'POST',
                body: JSON.stringify({ schoolId, sessionId, name })
            });
            setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
    };

    const handleActivateTerm = async (id, sessionId) => {
        try {
            await apiFetch(`${API_BASE}/super-admin/academic-periods/terms/${id}/activate`, {
                method: 'PATCH',
                body: JSON.stringify({ schoolId, sessionId })
            });
            setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
             <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Admin Configuration</h1>
                <p className="text-slate-500 font-medium mt-2">Configure classes, sessions, and standard fee structures</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><GraduationCap size={20} /> Manage Classes</h3>
                    <form onSubmit={handleAddClass} className="flex gap-4">
                        <input required placeholder="Class Name (e.g. SS1)" value={newClassName} onChange={e => setNewClassName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                        <input placeholder="Arm (e.g. A)" value={newClassArm} onChange={e => setNewClassArm(e.target.value)} className="w-32 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                        <button type="submit" disabled={loading} className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform"><Plus size={24} /></button>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {classes.map(c => (
                            <div key={c.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col items-center justify-center hover:bg-white hover:border-primary/20 hover:scale-105 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{c.arm || 'MAIN'}</p>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{c.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8">
                    <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3"><CreditCard size={20} /> Fee Structures</h3>
                    <div className="space-y-4">
                        {classes.map(c => {
                            const fee = fees.find(f => f.classId === c.id);
                            return (
                                <div key={c.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{c.name} {c.arm}</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-400">₦</span>
                                        <input 
                                            type="number" 
                                            defaultValue={fee?.amount || 0}
                                            onBlur={e => handleUpdateFee(c.id, e.target.value)}
                                            className="w-32 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-emerald-600 text-right outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {user?.role === 'SUPER_ADMIN' && (
                    <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8 lg:col-span-2">
                        <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest flex items-center gap-3"><ActivityIcon size={20} /> Academic Sessions</h3>
                        <form onSubmit={handleAddSession} className="flex gap-4">
                            <input required placeholder="Session Name (e.g. 2024/2025)" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                            <button type="submit" className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-900/10">Create Session</button>
                        </form>
                        <div className="space-y-8 mt-4">
                            {sessions.map(session => (
                                <div key={session.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group">
                                    {session.isCurrent && <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{session.name}</h4>
                                            {session.isCurrent && <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active</span>}
                                        </div>
                                        {!session.isCurrent && <button onClick={() => handleActivateSession(session.id)} className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 tracking-widest transition-colors">Set as Active</button>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {(session.terms || []).map(term => (
                                            <div key={term.id} className={`p-6 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2 ${term.isCurrent ? 'bg-white border-emerald-200 shadow-xl shadow-emerald-900/5' : 'bg-slate-100 border-transparent opactity-60'}`}>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{term.name}</p>
                                                {term.isCurrent ? <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span> : <button onClick={() => handleActivateTerm(term.id, session.id)} className="text-[8px] font-black text-slate-400 hover:text-primary transition-colors">SET ACTIVE</button>}
                                            </div>
                                        ))}
                                        <button onClick={() => { const name = prompt('Name (e.g. 1st Term)'); if (name) handleAddTerm(session.id, name); }} className="p-6 rounded-3xl border border-dashed border-slate-300 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-slate-400 transition-all">+ Add Term</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSetup;
