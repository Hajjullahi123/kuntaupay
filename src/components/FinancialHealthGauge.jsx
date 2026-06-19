import { Activity } from 'lucide-react';

const FinancialHealthGauge = ({ stats }) => {
    const percentageCollected = stats?.totalExpected > 0 ? (stats.totalPaid / stats.totalExpected) * 100 : 0;
    const isHealthy = percentageCollected >= 75;

    return (
        <div className="glass-card p-10 bg-white sophisticated-shadow border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-all duration-1000"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="font-bold text-xl text-slate-900">Revenue Flow Gauge</h3>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  isHealthy ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' :
                  'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/10'
                }`}>
                  {isHealthy ? 'Operational Health Secure' : 'Revenue Alert Protocol Active'}
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={2 * Math.PI * 80}
                            strokeDashoffset={2 * Math.PI * 80 * (1 - percentageCollected / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                            className={`${isHealthy ? 'text-primary' : 'text-primary'} transition-all duration-1000`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="text-4xl font-black text-slate-900">{Math.round(percentageCollected)}%</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Collected</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-8 mt-12 text-center border-t border-slate-100 pt-8">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Realized</p>
                      <p className="text-lg font-black text-slate-900 font-['Outfit'] tracking-tighter">₦{stats?.totalPaid?.toLocaleString()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</p>
                      <p className="text-lg font-black text-rose-500 font-['Outfit'] tracking-tighter">₦{stats?.totalBalance?.toLocaleString()}</p>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealthGauge;
