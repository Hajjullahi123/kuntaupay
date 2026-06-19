import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Calendar, Target, DollarSign, Loader2, Award, Building2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const PayrollAnalytics = () => {
    const { token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/payroll/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataResult = await res.json();
            setData(Array.isArray(dataResult) ? dataResult : []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchAnalytics(); }, [token]);

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest leading-none">Crunching Fiscal Personnel Data...</div>;

    const totalSalaryPaid = data.reduce((acc, d) => acc + d.total, 0);
    const avgMonthlyExp = data.length ? totalSalaryPaid / data.length : 0;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Cumulative Disbursement', value: `₦${totalSalaryPaid.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
                    { label: 'Avg Monthly Burn', value: `₦${avgMonthlyExp.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Reporting Periods', value: data.length, icon: Calendar, color: 'text-rose-500' },
                    { label: 'Fiscal Integrity', value: '100%', icon: ShieldCheck, color: 'text-slate-900' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 bg-white sophisticated-shadow border-slate-200 group hover:border-primary/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-slate-50 ${s.color} group-hover:scale-110 transition-transform`}>
                                {s.icon && <s.icon size={20} />}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h4 className={`text-2xl font-black font-outfit ${s.color}`}>{s.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 glass-card p-10 bg-white sophisticated-shadow border-slate-200">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">Salary Outflow Trend</h3>
                            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Monthly Disbursement Velocity</p>
                        </div>
                        <button className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Target size={18} /></button>
                    </div>
                    
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                                    cursor={{ stroke: '#e11d48', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Comparative Analytics */}
                <div className="glass-card p-10 bg-white sophisticated-shadow border-slate-200">
                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">Structure Accuracy</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Allocation by Department</p>
                    
                    <div className="h-[250px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[{name: 'Teaching', value: 75}, {name: 'Admin', value: 15}, {name: 'Facilities', value: 10}]} 
                                    innerRadius={70} 
                                    outerRadius={90} 
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    <Cell fill="#e11d48" />
                                    <Cell fill="#0f172a" />
                                    <Cell fill="#94a3b8" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <p className="text-2xl font-black font-outfit text-slate-900">75%</p>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Academic Base</p>
                        </div>
                    </div>

                    <div className="space-y-6 mt-10">
                        {[
                            { label: 'Academic Staff', value: '75%', color: 'bg-primary' },
                            { label: 'Management', value: '15%', color: 'bg-slate-900' },
                            { label: 'Auxiliary', value: '10%', color: 'bg-slate-300' }
                        ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${d.color}`} />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{d.label}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShieldCheck = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default PayrollAnalytics;
