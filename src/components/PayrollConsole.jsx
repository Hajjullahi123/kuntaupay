import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, MessageSquare, Send, Plus, X, MoreVertical, Printer, Smartphone, History, ShieldAlert, Download, BarChart2, LayoutList, UserSquare2 } from 'lucide-react';
import StaffVoucher from './StaffVoucher';
import PayrollAnalytics from './PayrollAnalytics';
import StaffSmartCard from './StaffSmartCard';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const PayrollConsole = ({ schoolId }) => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [activePeriod, setActivePeriod] = useState({ session: '...', term: '...' });
    
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'
    const [showDeductionModal, setShowDeductionModal] = useState(false);
    const [showAllowanceModal, setShowAllowanceModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [itemData, setItemData] = useState({ name: '', amount: '', explanation: '' });

    const fetchVouchers = () => {
        setLoading(true);
        fetch(`${API_BASE}/payroll/schedule?month=${month}&year=${year}`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setVouchers(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVouchers();
        fetch(`${API_BASE}/super-admin/academic-periods?schoolId=${schoolId}`)
            .then(res => res.json())
            .then(data => {
                const s = data.find(s => s.isCurrent);
                const t = s?.terms.find(t => t.isCurrent);
                setActivePeriod({ session: s?.name || 'N/A', term: t?.name || 'N/A' });
            });
    }, [month, year, schoolId]);

    const handleGenerate = async () => {
        try {
            const res = await fetch(`${API_BASE}/payroll/generate-vouchers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ month, year })
            });
            const data = await res.json();
            alert(data.message);
            fetchVouchers();
        } catch (err) { alert(err.message); }
    };

    const handlePay = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/payroll/vouchers/${id}/pay`, {
                method: 'PATCH',
                headers: { 'x-school-id': schoolId }
            });
            const data = await res.json();
            if (data.waLink) window.open(data.waLink, '_blank');
            fetchVouchers();
        } catch (err) { alert(err.message); }
    };

    const handleExport = () => {
        const token = localStorage.getItem('token');
        window.open(`${API_BASE}/payroll/export?month=${month}&year=${year}&token=${token}&schoolId=${schoolId || ''}`, '_blank');
    };

    const handleAddItem = async (e, type) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/payroll/vouchers/${selectedVoucher.id}/item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ ...itemData, type })
            });
            if (res.ok) {
                setShowDeductionModal(false);
                setShowAllowanceModal(false);
                fetchVouchers();
            }
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-xs font-black text-rose-500 uppercase tracking-[4px] mb-2">
                        <History size={14} /> Fiscal Disbursement Protocol • {activePeriod.session}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Payroll Console</h1>
                    <p className="text-slate-500 font-medium mt-3 uppercase text-[10px] tracking-widest border-l-2 border-emerald-500 pl-3">Active Focus: {new Date(0, month-1).toLocaleString('en', { month: 'long' })} {year}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                            <LayoutList size={20} />
                        </button>
                        <button onClick={() => setViewMode('analytics')} className={`p-2 rounded-xl transition-all ${viewMode === 'analytics' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                            <BarChart2 size={20} />
                        </button>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <select className="bg-transparent text-xs font-black uppercase tracking-widest px-4 py-2 outline-none" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>)}
                        </select>
                        <select className="bg-transparent text-xs font-black uppercase tracking-widest px-4 py-2 outline-none border-l border-slate-200" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>FY {y}</option>)}
                        </select>
                    </div>

                    <button onClick={handleExport} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-[2px] hover:bg-slate-50 text-slate-900 transition-all shadow-sm flex items-center gap-2">
                        <Download size={18} /> Master Excel
                    </button>

                    <button onClick={handleGenerate} className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black uppercase text-[11px] tracking-[2px] hover:bg-slate-800 text-white transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                        <Plus size={18} /> Execute Protocol
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Workforce', value: vouchers.length, color: 'text-slate-900' },
                    { label: 'Total Liability', value: `₦${vouchers.reduce((acc, v) => acc + v.netAmount, 0).toLocaleString()}`, color: 'text-primary' },
                    { label: 'Disbursed', value: vouchers.filter(v => v.status === 'PAID').length, color: 'text-emerald-500' },
                    { label: 'Defaulting Deductions', value: `₦${vouchers.reduce((acc, v) => acc + v.totalDeductions, 0).toLocaleString()}`, color: 'text-rose-500' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <h4 className={`text-3xl font-black font-['Outfit'] ${s.color}`}>{s.value}</h4>
                    </div>
                ))}
            </div>

            {viewMode === 'analytics' ? (
                <PayrollAnalytics />
            ) : (
                <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Personnel Entity</th>
                                <th className="px-8 py-5">Earnings Matrix</th>
                                <th className="px-8 py-5">Deductions / Defaults</th>
                                <th className="px-8 py-5">Net Payable</th>
                                <th className="px-8 py-5">Authorization Status</th>
                                <th className="px-8 py-5 text-right">Direct Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase overflow-hidden border border-slate-200">
                                                {v.staff.photoUrl ? (
                                                    <img src={v.staff.photoUrl} className="w-full h-full object-cover" alt="ID" />
                                                ) : (
                                                    <>{v.staff.firstName[0]}{v.staff.lastName[0]}</>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 font-['Outfit']">{v.staff.firstName} {v.staff.lastName}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{v.staff.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-black text-slate-900">₦{v.totalEarnings.toLocaleString()}</p>
                                            {v.items.filter(i => i.type === 'ADDITION' && i.name !== 'Basic Salary').map(i => (
                                                <p key={i.id} className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                                    + {i.name}: ₦{i.amount.toLocaleString()}
                                                </p>
                                            ))}
                                            {v.status === 'PENDING' && (
                                                <button onClick={() => { setSelectedVoucher(v); setItemData({ name: '', amount: '', explanation: '' }); setShowAllowanceModal(true); }} className="text-[9px] font-black text-emerald-600 uppercase tracking-[2px] mt-2 hover:underline">+ Add Allowance</button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col gap-1.5">
                                            <p className={`text-xs font-black font-['Outfit'] ${v.totalDeductions > 0 ? 'text-rose-500' : 'text-slate-300'}`}>- ₦{v.totalDeductions.toLocaleString()}</p>
                                            {v.items.filter(i => i.type === 'DEDUCTION').map(i => (
                                                <p key={i.id} className="text-[9px] text-rose-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                                    <AlertCircle size={10} className="text-rose-400" /> {i.name}: ₦{i.amount.toLocaleString()}
                                                </p>
                                            ))}
                                            {v.status === 'PENDING' && (
                                                <button onClick={() => { setSelectedVoucher(v); setItemData({ name: '', amount: '', explanation: '' }); setShowDeductionModal(true); }} className="text-[9px] font-black text-rose-500 uppercase tracking-[2px] mt-2 hover:underline">- Add Deduction</button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <p className="text-lg font-black text-primary font-['Outfit']">₦{v.netAmount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        {v.status === 'PAID' ? (
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> Execution Complete
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <ShieldAlert size={12} /> Pending Authorization
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setSelectedStaff(v.staff); setShowCardModal(true); }} className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-emerald-500 transition-all shadow-sm" title="View Smart ID Card">
                                                <UserSquare2 size={20} />
                                            </button>
                                            {v.status === 'PAID' ? (
                                                <button onClick={() => { setSelectedVoucher(v); setShowVoucherModal(true); }} className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm" title="View Print Protocol">
                                                    <Printer size={20} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handlePay(v.id)} className="p-3 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition-all shadow-xl hover:scale-105" title="Authorize and Notify WhatsApp">
                                                    <Smartphone size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(showDeductionModal || showAllowanceModal) && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-12 sophisticated-shadow bg-white animate-in zoom-in-95 duration-400 shadow-2xl relative">
                        <button onClick={() => { setShowDeductionModal(false); setShowAllowanceModal(false); }} className="absolute right-8 top-8 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                        <div className="mb-10">
                            <h3 className={`text-3xl font-black ${showAllowanceModal ? 'text-emerald-500' : 'text-rose-500'} mb-2`}>{showAllowanceModal ? 'Allowance Protocol' : 'Deduction Protocol'}</h3>
                            <p className="text-slate-500 text-sm font-medium">Record a fiscal adjustment with mandatory justification</p>
                        </div>
                        <form className="space-y-6" onSubmit={(e) => handleAddItem(e, showAllowanceModal ? 'ADDITION' : 'DEDUCTION')}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment Identity</label>
                                <input required className="input-field" value={itemData.name} placeholder="e.g. Overtime Bonus, Asset Damage" onChange={e => setItemData({...itemData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monetary Scale (₦)</label>
                                <input required type="number" className="input-field font-['Outfit']" placeholder="5000" value={itemData.amount} onChange={e => setItemData({...itemData, amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Justification (Explanation)</label>
                                <textarea required className="input-field h-32 py-4 resize-none" placeholder="Detailed reasoning..." value={itemData.explanation} onChange={e => setItemData({...itemData, explanation: e.target.value})}></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setShowDeductionModal(false); setShowAllowanceModal(false); }} className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                                <button type="submit" className={`flex-1 px-8 py-4 ${showAllowanceModal ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-2xl`}>Apply Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showVoucherModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                        <button onClick={() => setShowVoucherModal(false)} className="absolute right-8 top-8 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-2xl z-20">
                            <X size={20} />
                        </button>
                        <StaffVoucher voucher={selectedVoucher} />
                    </div>
                </div>
            )}

            {showCardModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="relative">
                        <button onClick={() => setShowCardModal(false)} className="absolute -right-12 -top-12 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all z-20">
                            <X size={24} />
                        </button>
                        <StaffSmartCard staff={selectedStaff} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollConsole;
