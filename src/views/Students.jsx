import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, AlertCircle, Loader2, Receipt, X, CreditCard, Printer, Trash2, Percent, Link as LinkIcon } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';
import SecureReceipt from '../components/SecureReceipt';

// Payment Modal
export const PaymentModal = ({ isOpen, onClose, student, onComplete, schoolId }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [ref, setRef] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !student) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}/payment/payment`, {
                method: 'POST',
                body: JSON.stringify({
                    studentId: student.id,
                    amount: parseFloat(amount),
                    paymentMethod: method,
                    reference: ref,
                    notes: notes,
                    termId: 1, // Default logic: backend finds active
                    academicSessionId: 1
                })
            }, schoolId);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onComplete();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-50/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white sophisticated-shadow border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 shadow-2xl">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center text-slate-900">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Record Institution Payment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (₦)</label>
                            <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Method</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                                <option value="cash">Cash</option>
                                <option value="transfer">Bank Transfer</option>
                                <option value="pos">POS</option>
                                <option value="scholarship">Scholarship Override</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reference</label>
                            <input value={ref} onChange={(e) => setRef(e.target.value)} type="text" placeholder="TRX-XXXXXX" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                        </div>
                    </div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 outline-none resize-none" placeholder="Add additional payment details..."></textarea>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary-600 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Post Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Link Parent Modal
export const LinkParentModal = ({ isOpen, onClose, student, onComplete, schoolId }) => {
    const [formData, setFormData] = useState({ username: '', password: '', firstName: '', lastName: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}/payment/${student.id}/link-parent`, {
                method: 'POST',
                body: JSON.stringify(formData)
            }, schoolId);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onComplete();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-slate-50/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white sophisticated-shadow border-slate-200 w-full max-w-md overflow-hidden p-8 space-y-6">
                <div className="flex justify-between items-center text-slate-900">
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Link Parent Node</h3>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Linking to {student.firstName} {student.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Parent First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Parent Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <input required placeholder="Parent Username (for login)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input type="password" required placeholder="Temporary Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    
                    <div className="flex gap-4 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Link Parent
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Add Student Modal
export const AddStudentModal = ({ isOpen, onClose, onComplete, schoolId }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', admissionNumber: '', classId: '', isScholarship: false, scholarshipPercentage: 0 });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) apiFetch(`${API_BASE}/payment/classes`, {}, schoolId).then(res => res.json()).then(setClasses);
    }, [isOpen, schoolId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}/payment/students`, {
                method: 'POST',
                body: JSON.stringify(formData)
            }, schoolId);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onComplete(); onClose();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white sophisticated-shadow border-slate-200 w-full max-w-md overflow-hidden p-8 space-y-6">
                <h3 className="text-xl font-bold uppercase text-slate-900">Register Student</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="First" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Last" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <input required placeholder="Admission ID" value={formData.admissionNumber} onChange={e => setFormData({...formData, admissionNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                    <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                        <option value="">Select Class Matrix</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.arm}</option>)}
                    </select>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <input type="checkbox" checked={formData.isScholarship} onChange={e => setFormData({...formData, isScholarship: e.target.checked})} className="w-4 h-4" />
                        <label className="text-xs font-bold text-slate-700">Scholarship Logic</label>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button onClick={onClose} type="button" className="flex-1 py-3 text-sm font-bold bg-slate-100 rounded-xl">DISCARD</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-bold bg-slate-900 text-white rounded-xl">INITIATE</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Payment History Modal
export const PaymentHistoryModal = ({ isOpen, onClose, student, schoolId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [schoolInfo, setSchoolInfo] = useState(null);

    useEffect(() => {
        if (isOpen && student) {
            setLoading(true);
            apiFetch(`${API_BASE}/payment/payments/${student.id}`, {}, schoolId)
                .then(res => res.json())
                .then(data => { setHistory(Array.isArray(data) ? data : []); setLoading(false); })
                .catch(() => setLoading(false));
            
            fetch(`${API_BASE}/branches`).then(res => res.json()).then(branches => setSchoolInfo(branches.find(b => b.id === schoolId)));
        }
    }, [isOpen, student, schoolId]);

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white sophisticated-shadow border-slate-200 w-full max-w-2xl overflow-hidden p-8">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold uppercase text-slate-900 tracking-tight">Financial Ledger</h3>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Audit for {student.firstName} {student.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                </header>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? <div className="py-20 text-center text-xs font-bold uppercase text-slate-300 animate-pulse tracking-[4px]">Syncing Data Stream...</div> : history.map((tx, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center text-primary-600 rounded-xl"><Receipt size={20} /></div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">₦{tx.amount.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{new Date(tx.paymentDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedPayment(tx)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><Printer size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <SecureReceipt isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} payment={selectedPayment} student={student} school={schoolInfo} />
            </div>
        </div>
    );
};

const Students = ({ schoolId, globalRefresh }) => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [historyStudent, setHistoryStudent] = useState(null);
    const [linkParentStudent, setLinkParentStudent] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [addingStudent, setAddingStudent] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(null);

    useEffect(() => {
        apiFetch(`${API_BASE}/payment/students`, {}, schoolId)
            .then(res => res.json())
            .then(data => setStudents(data));
    }, [refresh, schoolId, globalRefresh]);

    const handleToggleClearance = async (studentId) => {
        setLoadingToggle(studentId);
        try {
            await apiFetch(`${API_BASE}/payment/toggle-clearance/${studentId}`, { method: 'POST' }, schoolId);
            setRefresh(r => r + 1);
        } catch (err) { alert(err.message); }
        finally { setLoadingToggle(null); }
    };

    const filtered = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || s.admissionNumber.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Ledger</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage student fee profiles and academic clearance</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setAddingStudent(true)} className="px-6 py-3.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/10 hover:scale-105 transition-all flex items-center gap-2"><Plus size={16} /> Register Student</button>
                    <div className="bg-white border border-slate-200 rounded-xl pl-5 pr-3 py-3 shadow-sm flex items-center gap-3 w-72">
                        <Search className="text-slate-300" size={18} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="bg-transparent text-sm font-bold border-none outline-none w-full" />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-3xl sophisticated-shadow border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {['Student Name', 'Admission ID', 'Class', 'Status', 'Liability', 'Action'].map(col => (
                                <th key={col} className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(s => {
                            const balance = s.feeRecords[0]?.balance || 0;
                            return (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all uppercase">{s.firstName[0]}{s.lastName[0]}</div>
                                            <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{s.firstName} {s.lastName}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-400 text-xs">{s.admissionNumber}</td>
                                    <td className="px-8 py-6 font-bold text-slate-500 text-xs uppercase">{s.classModel?.name} {s.classModel?.arm}</td>
                                    <td className="px-8 py-6 text-xs uppercase tracking-widest font-bold">
                                        {s.feeRecords[0]?.isClearedForExam ? <span className="text-emerald-500">Authorized</span> : <span className="text-rose-500 font-bold">Restricted</span>}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold tracking-tight" style={{ color: balance > 0 ? '#f43f5e' : '#10b981' }}>₦{balance.toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleToggleClearance(s.id)} className={`p-3 rounded-xl border transition-all ${s.feeRecords[0]?.isClearedForExam ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                                {loadingToggle === s.id ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                                            </button>
                                            <button onClick={() => setHistoryStudent(s)} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"><Receipt size={16} /></button>
                                            <button onClick={() => setLinkParentStudent(s)} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><LinkIcon size={16} /></button>
                                            <button onClick={() => setSelectedStudent(s)} className="px-4 py-2.5 bg-slate-900 rounded-lg text-white text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Record Payment</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AddStudentModal isOpen={addingStudent} onClose={() => setAddingStudent(false)} onComplete={() => setRefresh(r => r + 1)} schoolId={schoolId} />
            <PaymentModal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} student={selectedStudent} onComplete={() => setRefresh(r => r + 1)} schoolId={schoolId} />
            <PaymentHistoryModal isOpen={!!historyStudent} onClose={() => setHistoryStudent(null)} student={historyStudent} schoolId={schoolId} />
            <LinkParentModal isOpen={!!linkParentStudent} onClose={() => setLinkParentStudent(null)} student={linkParentStudent} onComplete={() => setRefresh(r => r + 1)} schoolId={schoolId} />
        </div>
    );
};

const ShieldCheck = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Students;
