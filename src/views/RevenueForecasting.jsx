import { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, AlertTriangle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const RevenueForecasting = ({ schoolId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`${API_BASE}/analytics/forecast`, {}, schoolId)
            .then(res => res.json())
            .then(resData => {
                if (!resData.error) setData(resData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [schoolId]);

    if (loading) return <div className="p-20 text-center animate-pulse text-primary font-black uppercase tracking-[5px]">Calibrating Fiscal Projections...</div>;
    if (!data) return <div className="p-20 text-center text-rose-500 font-bold">No active fiscal window detectable for this institution.</div>;

    const { metrics, debtAging } = data;

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
             <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Revenue Forecasting</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                           {data.session} • {data.term}
                        </div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Live Projection Active
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Confidence Matrix */}
                <div className="bg-white rounded-[40px] sophisticated-shadow p-10 relative overflow-hidden group border border-slate-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fiscal Confidence Score</p>
                    <h2 className="text-6xl font-black text-slate-900">{Math.round(metrics.confidenceScore)}%</h2>
                    <div className="mt-8 space-y-4">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 transition-all duration-1000" style={{ width: `${metrics.confidenceScore}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Based on current payment velocity and interaction frequency.</p>
                    </div>
                </div>

                {/* End of Term Forecast */}
                <div className="bg-[#184a2c] text-white rounded-[40px] sophisticated-shadow p-10 lg:col-span-2 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-emerald-900/40">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mb-32 -mr-32"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[4px] mb-4">Projected Cash at Term-End</p>
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-7xl font-black tracking-tighter">₦{Math.round(metrics.forecastedTotal).toLocaleString()}</h2>
                            <p className="text-emerald-300/60 font-black text-lg">Estimated</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-10 mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/60 mb-1">Guaranteed (Paid)</p>
                            <p className="text-xl font-bold">₦{metrics.totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/60 mb-1">Expected Recovery</p>
                            <p className="text-xl font-bold">₦{Math.round(metrics.projectedAdditional).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Velocity Chart */}
                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 h-96">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                        <TrendingUp size={20} className="text-primary-600" /> Accumulation Velocity
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={data.velocitySeries}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0e6ae9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0e6ae9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                                axisLine={false} 
                                tickLine={false} 
                                tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(str) => new Date(str).toLocaleDateString()}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#0e6ae9" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Debt Aging Matrix */}
                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <Target size={20} className="text-rose-500" /> Liability Aging Matrix
                    </h3>
                    <div className="grid grid-cols-1 gap-4 mt-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500"><ShieldCheck size={20} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">Recoverable Debt</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Balances under ₦50k</p>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{debtAging.low}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-amber-50 hover:border-amber-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">Moderate Exposure</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Balances ₦50k - ₦150k</p>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{debtAging.medium}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-rose-50 hover:border-rose-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500"><AlertTriangle size={20} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">Critical Liability</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Balances above ₦150k</p>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{debtAging.high}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Hub */}
            <div className="bg-slate-50 rounded-[40px] border border-slate-200 p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-primary-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary-600/30">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recover Current Leakage</h4>
                        <p className="text-slate-500 font-medium max-w-md mt-2">The engine predicts ₦{Math.round(metrics.projectedAdditional).toLocaleString()} in recoverable assets remains unlocked this term.</p>
                    </div>
                </div>
                <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] shadow-xl hover:scale-105 transition-all flex items-center gap-4">
                    Trigger Recovery Workflows <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default RevenueForecasting;
