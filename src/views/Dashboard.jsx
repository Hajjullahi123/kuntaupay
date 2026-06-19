import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Download, Users, Target, Bell, CreditCard, ArrowRight, Activity as ActivityIcon } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatsOverview from '../components/StatsOverview';

export const RoleBasedRedirect = ({ schoolId, globalRefresh }) => {
    const { user, token, loading } = useAuth();
    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase py-40 tracking-[4px]">Verifying Authorization...</div>;
    
    // If not authenticated, always revert to landing page
    if (!token) return <Navigate to="/landing" />;

    if (user?.role === 'SUPER_ADMIN') {
        return <Navigate to="/super-admin" />;
    }
    if (user?.role === 'PARENT') {
        return <Navigate to="/parent" />;
    }
    return <Dashboard schoolId={schoolId} globalRefresh={globalRefresh} />;
};

const Dashboard = ({ schoolId, globalRefresh }) => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setError(null);
        apiFetch(`${API_BASE}/payment/summary`, {}, schoolId)
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    setStats(data);
                } else {
                    setError(data.error || `Server Error: ${res.status}`);
                }
            })
            .catch(err => {
                console.error('Dashboard load error:', err);
                setError(err.message);
            });
    }, [schoolId, globalRefresh]);

    if (error) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-12 text-center max-w-lg">
                    <p className="text-rose-500 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Connection Error</p>
                    <p className="text-slate-900 font-bold mb-8 leading-relaxed">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Retry Connection</button>
                </div>
            </div>
        );
    }

    if (!stats) return (
        <div className="space-y-12 py-10 animate-in fade-in duration-1000">
            <div className="flex flex-col gap-4">
                <div className="h-12 w-64 skeleton"></div>
                <div className="h-4 w-96 skeleton opacity-50"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-40 glass-card skeleton"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 h-96 glass-card skeleton"></div>
                <div className="h-96 glass-card skeleton"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 px-4">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 bg-clip-text text-transparent pb-1">
                       Financial Overview
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-sm">Optimizing institutional revenue streams and debt recovery.</p>
                </div>
                <button onClick={() => navigate('/students')} className="group px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/10">
                    <CreditCard size={18} className="group-hover:rotate-12 transition-transform" /> Record Transaction
                </button>
            </header>

            <StatsOverview stats={stats} />

            <div className="mt-16 w-full">
                <div className="space-y-12">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em]">Recent Transactions</h3>
                    </div>
                    
                    <div className="grid gap-6">
                        {(stats.recentActivity || []).length > 0 ? (
                            stats.recentActivity.slice(0, 8).map((activity, i) => (
                                <div key={i} className="flex items-center justify-between p-8 glass-card group cursor-pointer border-slate-200 hover:border-slate-400 shadow-sm">
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-500 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{activity.studentName}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">ID: {activity.reference || 'AUTO-GEN'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-950 tracking-tighter">₦{activity.amount.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.1em] mt-2">Verified • {new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-32 text-center glass-card border-dashed border-slate-300 flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <ActivityIcon size={40} />
                                </div>
                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">No recent transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
