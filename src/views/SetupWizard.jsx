import React, { useState } from 'react';
import { ShieldCheck, Building2, UserCircle, CheckCircle2, Loader2, ArrowRight, ArrowLeft, Key } from 'lucide-react';
import KuntauPayLogo from '../components/KuntauPayLogo';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SetupWizard = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        schoolName: '',
        adminUsername: '',
        adminPassword: '',
        firstName: '',
        lastName: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/system/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Success! Store token and redirect
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 mb-4">
                                <Building2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">School Identity</h2>
                            <p className="text-slate-500 text-sm">Tell us about your institution.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Name</label>
                            <input 
                                value={formData.schoolName}
                                onChange={e => setFormData({...formData, schoolName: e.target.value})}
                                placeholder="e.g. Green Valley International"
                                className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            />
                        </div>
                        <button 
                            disabled={!formData.schoolName}
                            onClick={handleNext}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                        >
                            Next Step <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-500 mb-4">
                                <UserCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Owner</h2>
                            <p className="text-slate-500 text-sm">Create the primary administrator account.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                                <input 
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                                <input 
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                                <input 
                                    value={formData.adminUsername}
                                    onChange={e => setFormData({...formData, adminUsername: e.target.value})}
                                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <input 
                                    type="password"
                                    value={formData.adminPassword}
                                    onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleBack} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Back</button>
                            <button 
                                disabled={!formData.adminUsername || !formData.adminPassword}
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-500 transition-all flex items-center justify-center gap-2 glow-button"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                Initialize System
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center py-12 px-6 relative overflow-x-hidden overflow-y-auto">
            {/* Background Accents */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-xl relative z-10 my-auto">
                <div className="flex justify-center mb-12">
                    <KuntauPayLogo size={64} />
                </div>

                <div className="bg-white rounded-[32px] p-10 sophisticated-shadow border border-slate-200 overflow-hidden min-h-[500px] flex flex-col justify-center">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center gap-3 animate-in shake duration-500">
                             <ShieldCheck size={20} />
                             {error}
                        </div>
                    )}

                    {renderStep()}

                    {/* Progress Indicator */}
                    <div className="mt-10 flex justify-center gap-2">
                        {[1, 2].map(i => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-primary-500' : 'w-2 bg-slate-100'}`}
                            ></div>
                        ))}
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-[4px]">Kuntau-Pay Matrix • Standalone v1.0</p>
            </div>
        </div>
    );
};

export default SetupWizard;
