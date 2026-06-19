import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Loader2, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import KuntauPayLogo from '../components/KuntauPayLogo';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, token, user } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // If already logged in, skip the login screen
        if (token && user) {
            navigate(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/');
            return;
        }

        fetch(`${API_BASE}/system/status`)
            .then(res => res.json())
            .then(data => setIsInitialized(data.isInitialized))
            .catch(() => setIsInitialized(true));
    }, [token, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            login(data.token, data.user);
            
            if (data.user.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else if (data.user.role === 'SCHOOL_ADMIN' && data.schoolCount === 0) {
                // If they have no branches yet, send them to manage branches
                navigate('/manage-branches');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-['Outfit']">
            {/* High-Fidelity Mesh Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-100 blur-[160px] rounded-full animate-pulse opacity-60"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-emerald-100 blur-[180px] rounded-full opacity-40"></div>
                <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-primary-100 blur-[140px] rounded-full animate-bounce duration-[10s]"></div>
            </div>

            {/* Floating Back Button */}
            <button 
                onClick={() => navigate('/landing')}
                className="fixed top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 bg-white/80 hover:bg-slate-100 backdrop-blur-xl border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-[0.3em] transition-all shadow-sm group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home Page
            </button>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="inline-block p-1 bg-gradient-to-tr from-slate-200 via-slate-100 to-transparent rounded-[3rem] shadow-xl">
                        <div className="bg-white p-8 rounded-[2.8rem] border border-slate-100">
                            <KuntauPayLogo size={60} />
                        </div>
                    </div>
                </div>

                {!isInitialized ? (
                    <div className="glass-card p-12 text-center space-y-10 border-slate-200 bg-white/80 backdrop-blur-3xl animate-in zoom-in-95 duration-700 shadow-xl">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto text-slate-900 border border-slate-200 shadow-md">
                            <ShieldCheck size={44} className="animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">System Not Initialized</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[320px] mx-auto">No school data detected. Please run the setup wizard to proceed.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/setup')}
                            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Initialize System
                        </button>
                    </div>
                ) : (
                    <div className="glass-card p-10 md:p-16 border border-slate-200 bg-white/80 backdrop-blur-3xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.1)]">
                        <div className="text-center mb-16">
                            <h1 className="text-5xl font-bold text-slate-900 tracking-tighter mb-4">
                                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">Login</span>
                            </h1>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5em]">Secure Access</p>
                        </div>
                        
                        <form className="space-y-10" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-2">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-slate-100 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors z-10" size={20} />
                                    <input 
                                        type="text"
                                        required
                                        className="relative z-10 w-full bg-white border border-slate-200 focus:border-slate-400 rounded-2xl py-5 pl-16 pr-8 text-[14px] font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-sm"
                                        placeholder="Enter Username"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-2">Password</label>
                                <div className="relative group">
                                     <div className="absolute inset-0 bg-slate-100 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors z-10" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="relative z-10 w-full bg-white border border-slate-200 focus:border-slate-400 rounded-2xl py-5 pl-16 pr-16 text-[14px] font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-sm"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-2 z-20">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-6 bg-rose-50 border border-rose-200 rounded-[1.5rem] animate-in fade-in zoom-in-95 duration-300">
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] text-center leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button 
                                    disabled={loading}
                                    type="submit" 
                                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-[1.01] active:scale-[0.99] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>Login <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <footer className="text-center mt-12 mb-8">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.8em]">
                         Kuntau Pay &bull; Secure System &bull; Admin Portal
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
