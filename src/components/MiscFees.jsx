import { useState, useEffect } from 'react'
import { Plus, CreditCard, Receipt, Loader2, Search } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const MiscFees = ({ schoolId }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [searchStudent, setSearchStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [payData, setPayData] = useState({ amount: '', paymentMethod: 'cash' });

    useEffect(() => {
        fetchFees();
    }, [schoolId]);

    const fetchFees = () => {
        setLoading(true);
        fetch(`${API_BASE}/misc-fees`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setFees(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    const handleSearchStudents = (val) => {
        setSearchStudent(val);
        if (val.length > 2) {
            fetch(`${API_BASE}/payment/students?search=${val}`, { headers: { 'x-school-id': schoolId } })
                .then(res => res.json())
                .then(data => setStudents(Array.isArray(data) ? data : []));
        }
    };

    const handlePayment = async (studentId) => {
        if (!payData.amount) return alert('Enter amount');
        try {
            await fetch(`${API_BASE}/misc-fees/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({
                    studentId,
                    miscFeeId: selectedFee.id,
                    amount: payData.amount,
                    paymentMethod: payData.paymentMethod
                })
            });
            setShowPayModal(false);
            alert('Payment recorded successfully');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Ad-hoc Revenue</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage miscellaneous fees and non-tuition payments</p>
                </div>
                <button className="btn-primary shadow-lg">
                    <Plus size={18} /> New Fee Type
                </button>
            </header>

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-gold" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fees.map(fee => (
                        <div key={fee.id} className="glass-card p-6 border-slate-200 hover:border-primary/20 transition-all group bg-white sophisticated-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <CreditCard size={24} />
                                </div>
                                <span className="text-2xl font-black text-slate-900">₦{fee.amount.toLocaleString()}</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{fee.name}</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                {fee.isCompulsory ? 'Compulsory' : 'Optional Fee'}
                            </p>
                            
                            <button 
                                onClick={() => { setSelectedFee(fee); setShowPayModal(true); }}
                                className="mt-8 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-slate-700"
                            >
                                Record Payment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Pay Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-slate-50/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-lg p-8 bg-white sophisticated-shadow">
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Record Payment</h3>
                        <p className="text-slate-500 text-sm mb-6 font-medium">Recording payment for <span className="text-primary font-bold">{selectedFee.name}</span></p>
                        
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search student by name or ADM..." 
                                    className="input-field pl-12"
                                    onChange={(e) => handleSearchStudents(e.target.value)}
                                />
                            </div>

                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {students.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => handlePayment(s.id)}
                                        className="w-full p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-gold/30 flex items-center justify-between group"
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-bold">{s.firstName} {s.lastName}</p>
                                            <p className="text-[10px] text-slate-500">{s.admissionNumber}</p>
                                        </div>
                                        <Plus size={16} className="text-slate-600 group-hover:text-gold" />
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl"
                                    value={payData.amount}
                                    onChange={e => setPayData({...payData, amount: e.target.value})}
                                />
                                <select 
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl"
                                    value={payData.paymentMethod}
                                    onChange={e => setPayData({...payData, paymentMethod: e.target.value})}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="pos">POS</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setShowPayModal(false)} className="px-6 py-3 text-sm font-bold text-slate-500">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiscFees;
