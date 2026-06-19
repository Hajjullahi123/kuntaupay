import { CreditCard, LayoutDashboard, Receipt, GraduationCap, ArrowUpRight } from 'lucide-react'

const StatsOverview = ({ stats }) => {
    if (!stats || stats.error || typeof stats.totalPaid === 'undefined') return null;

    const cards = [
        { 
            label: 'Collected', 
            value: `₦${(stats?.totalPaid || 0).toLocaleString()}`, 
            sub: 'Total Revenue',
            icon: CreditCard, 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10',
            border: 'group-hover:border-emerald-500/50',
            glow: 'bg-emerald-500'
        },
        { 
            label: 'Projected', 
            value: `₦${(stats?.totalExpected || 0).toLocaleString()}`, 
            sub: 'Expected Revenue',
            icon: LayoutDashboard, 
            color: 'text-indigo-400', 
            bg: 'bg-indigo-500/10',
            border: 'group-hover:border-indigo-500/50',
            glow: 'bg-indigo-500'
        },
        { 
            label: 'Outstanding', 
            value: `₦${(stats?.totalBalance || 0).toLocaleString()}`, 
            sub: 'Unpaid Debts',
            icon: Receipt, 
            color: 'text-rose-400', 
            bg: 'bg-rose-500/10',
            border: 'group-hover:border-rose-500/50',
            glow: 'bg-rose-500'
        },
        { 
            label: 'Fully Paid', 
            value: stats?.clearedStudents || 0, 
            sub: 'Cleared Students',
            icon: GraduationCap, 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10',
            border: 'group-hover:border-amber-500/50',
            glow: 'bg-amber-500'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat, i) => (
                <div key={i} className={`relative overflow-hidden bg-slate-950 rounded-3xl border border-slate-800 p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-1 group ${stat.border}`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.glow} opacity-[0.06] rounded-bl-full transition-transform duration-500 group-hover:scale-125`}></div>
                    <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner`}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-5">{stat.value}</h3>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${stat.glow} animate-pulse`}></div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
