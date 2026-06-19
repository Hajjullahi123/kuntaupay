import { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Banknote, Shield, Search, X, Loader2, ArrowUpRight, Download, Upload, Edit3, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const StaffManagement = ({ schoolId }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', role: 'TEACHER', bankDetails: '', baseSalary: '', isActive: true });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStaff = () => {
        setLoading(true);
        fetch(`${API_BASE}/payroll/staff`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setStaff(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    useEffect(() => fetchStaff(), [schoolId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `${API_BASE}/payroll/staff/${selectedStaffId}` : `${API_BASE}/payroll/staff`;
            const method = editMode ? 'PATCH' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setEditMode(false);
                setSelectedStaffId(null);
                fetchStaff();
            }
        } catch (err) { alert(err.message); }
    };

    const handleEdit = (s) => {
        setFormData({ ...s });
        setSelectedStaffId(s.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDownloadTemplate = () => {
        window.open(`${API_BASE}/payroll/staff/template`, '_blank');
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            try {
                const res = await fetch(`${API_BASE}/payroll/staff/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                    body: JSON.stringify({ staffList: data })
                });
                const result = await res.json();
                alert(result.message);
                fetchStaff();
            } catch (err) { alert(err.message); }
        };
        reader.readAsBinaryString(file);
    };

    const filteredStaff = staff.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[4px] mb-2">
                        <Shield size={14} /> Personnel Command
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Staff Directory</h1>
                    <p className="text-slate-500 font-medium mt-3">Manage educational enterprise personnel and salary structures</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadTemplate} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-[2px] hover:bg-slate-50 text-slate-900 transition-all shadow-sm flex items-center gap-2">
                        <Download size={16} /> Template
                    </button>
                    <div className="relative">
                        <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <button className="px-6 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black uppercase text-[10px] tracking-[2px] hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-2 pointer-events-none">
                            <Upload size={16} /> Bulk Upload
                        </button>
                    </div>
                    <button onClick={() => { setEditMode(false); setFormData({ firstName: '', lastName: '', phone: '', role: 'TEACHER', bankDetails: '', baseSalary: '', isActive: true }); setShowModal(true); }} className="btn-primary shadow-2xl flex items-center gap-2 group">
                        <UserPlus size={18} className="transition-transform group-hover:scale-110" />
                        Induct Staff
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Workforce</p>
                    <h4 className="text-4xl font-black text-slate-900 font-['Outfit']">{staff.length}</h4>
                </div>
                <div className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Commitment</p>
                    <h4 className="text-4xl font-black text-primary font-['Outfit']">₦{staff.reduce((acc, s) => acc + s.baseSalary, 0).toLocaleString()}</h4>
                </div>
                <div className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Nodes</p>
                    <h4 className="text-4xl font-black text-rose-500 font-['Outfit']">100%</h4>
                </div>
            </div>

            <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-xl text-slate-900">Personnel Registry</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" className="bg-white border border-slate-200 rounded-xl pl-11 pr-6 py-3 text-[11px] font-bold w-72 outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-widest" placeholder="SEARCH DIRECTORY..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Personnel Identity</th>
                            <th className="px-8 py-5">Corporate Role</th>
                            <th className="px-8 py-5">Contact Vector</th>
                            <th className="px-8 py-5">Compensation</th>
                            <th className="px-8 py-5 text-right">Direct Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredStaff.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors ring-1 ring-inset ring-slate-200 group-hover:ring-primary/20">
                                            <Users size={22} />
                                        </div>
                                        <div>
                                            <p className="text-md font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Reference ID: {s.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest">{s.role}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5 flex flex-col">
                                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {s.phone}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Banknote size={12} className="text-slate-400" /> {s.bankDetails || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-md font-black text-slate-900 font-['Outfit']">₦{s.baseSalary.toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(s)} className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm">
                                            <Edit3 size={20} />
                                        </button>
                                        <button className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-xl p-12 sophisticated-shadow bg-white animate-in zoom-in-95 duration-400 shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                        <div className="mb-10">
                            <h3 className="text-3xl font-black text-slate-900 mb-2">{editMode ? 'Protocol Modification' : 'Personnel Induction'}</h3>
                            <p className="text-slate-500 text-sm font-medium">Configure corporate parameters for this staff entity</p>
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                                    <input required className="input-field" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                                    <input required className="input-field" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                                    <input required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary (₦)</label>
                                    <input required type="number" className="input-field font-['Outfit']" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Role</label>
                                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="TEACHER">Pedagogical Expert (Teacher)</option>
                                    <option value="PRINCIPAL">Node Director (Principal)</option>
                                    <option value="BURSAR">Ledger Custodian (Bursar)</option>
                                    <option value="ADMIN">System Executive (Admin)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Details</label>
                                <input className="input-field" value={formData.bankDetails} onChange={e => setFormData({...formData, bankDetails: e.target.value})} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                                <button type="submit" className="btn-primary flex-1 shadow-2xl">Confirm Command</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
