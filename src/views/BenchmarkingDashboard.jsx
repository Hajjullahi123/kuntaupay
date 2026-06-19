import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, Users, School, DollarSign, Target, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const BenchmarkingDashboard = () => {
    const { token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/super-admin/analytics/benchmarking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(resData => {
            setData(Array.isArray(resData) ? resData : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [token]);

    const stats = {
        totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
        totalDebt: data.reduce((sum, item) => sum + item.debt, 0),
        avgEfficiency: data.length > 0 ? data.reduce((sum, item) => sum + item.efficiency, 0) / data.length : 0,
        totalStudents: data.reduce((sum, item) => sum + item.studentCount, 0)
    };

    if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400">Compiling Fiscal Matrix...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Revenue Benchmarking</h1>
                <p className="text-slate-500 font-medium mt-2">Comparative fiscal analysis across institutional nodes</p>
            </header>

            {/* Core Metrics Deck */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Ecosystem Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'text-emerald-600', prefix: '₦' },
                    { label: 'Outstanding Liabilities', value: stats.totalDebt, icon: TrendingDown, color: 'text-rose-600', prefix: '₦' },
                    { label: 'Global Enrollment', value: stats.totalStudents, icon: Users, color: 'text-primary-600' },
                    { label: 'Collection Efficiency', value: stats.avgEfficiency.toFixed(1), icon: Target, color: 'text-blue-600', suffix: '%' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] sophisticated-shadow border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon size={24} className="text-slate-300" />
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Fiscal Node</span>
                        </div>
                        <div className={`text-3xl font-black ${stat.color} mb-1`}>
                            {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Comparison */}
                <div className="bg-white p-10 rounded-[40px] sophisticated-shadow border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <TrendingUp size={20} className="text-emerald-500" />
                        Revenue Distribution
                    </h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="revenue" fill="#4f46e5" radius={[10, 10, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={entry.revenue > 1000000 ? '#10b981' : '#4f46e5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Index */}
                <div className="bg-white p-10 rounded-[40px] sophisticated-shadow border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Award size={20} className="text-amber-500" />
                        Efficiency Index
                    </h2>
                    <div className="space-y-6">
                        {data.sort((a,b) => b.efficiency - a.efficiency).map((school, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank #{i+1}</span>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{school.name}</h4>
                                    </div>
                                    <span className="text-sm font-black text-primary">{school.efficiency.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${school.efficiency > 80 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : school.efficiency > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                        style={{ width: `${school.efficiency}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Ledger Table */}
            <div className="bg-white rounded-[40px] overflow-hidden sophisticated-shadow border border-slate-100">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50">
                            {['Institution', 'Organization', 'Students', 'Revenue', 'Outstanding', 'Collection'].map((col) => (
                                <th key={col} className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((school) => (
                            <tr key={school.schoolId} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6 font-black text-slate-900 uppercase tracking-tight text-sm">{school.name}</td>
                                <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-bold text-slate-500">{school.organization}</span></td>
                                <td className="px-8 py-6 font-bold text-slate-600">{school.studentCount}</td>
                                <td className="px-8 py-6 font-black text-emerald-600">₦{school.revenue.toLocaleString()}</td>
                                <td className="px-8 py-6 font-black text-rose-600">₦{school.debt.toLocaleString()}</td>
                                <td className="px-8 py-6">
                                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black inline-block ${school.efficiency > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {school.efficiency.toFixed(1)}% SUCCESS
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BenchmarkingDashboard;
