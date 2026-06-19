import { Building2, Settings as SettingsIcon, Bell, Download, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl">
             <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">System Preferences</h1>
                <p className="text-slate-500 font-medium mt-2">Environment orchestration: internal parameters and administrative security nodes</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8">
                    <h3 className="text-sm font-black flex items-center gap-3 border-b border-slate-50 pb-6 uppercase tracking-widest"><Building2 size={20} className="text-primary" /> Identity Signature</h3>
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Designation</label>
                            <input disabled value="Excellence Academy Standalone" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-500 cursor-not-allowed" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Governance Contact</label>
                            <input disabled value="admin@excellence.standalone" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-500 cursor-not-allowed" />
                         </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] sophisticated-shadow border border-slate-100 p-10 space-y-8 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-sm font-black flex items-center gap-3 border-b border-slate-50 pb-6 uppercase tracking-widest"><SettingsIcon size={20} className="text-primary" /> System Controls</h3>
                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Bell size={20} /></div>
                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Auto-SMS Broadcasts</div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Download size={20} /></div>
                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Cloud Sync Bridge</div>
                            </div>
                            <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1">
                                <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-1"></div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50/50 rounded-[40px] border border-rose-100 p-10">
                <h3 className="text-sm font-black flex items-center gap-3 text-rose-600 uppercase tracking-widest mb-8"><AlertCircle size={20} /> Institutional Danger Zone</h3>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <p className="font-black text-slate-900 uppercase tracking-tight">Purge & Global Re-seed</p>
                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Permanently incinerate all transaction signatures and temporal data nodes. This action is catastrophic and cannot be reversed by platform support.</p>
                    </div>
                    <button className="px-10 py-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-rose-900/10">Execute System Purge</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
