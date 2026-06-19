import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Activity, AlertCircle, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const ParentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/parent`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => {
            setProfile(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Activity className="animate-spin text-slate-400" /></div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-slate-500">Failed to load profile.</div>;
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Parent Portal</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your children and view their academic and financial records.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.students && profile.students.length > 0 ? (
                    profile.students.map(student => (
                        <div key={student.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
                                        <span className="text-xs font-medium text-slate-500">ID: {student.admissionNumber}</span>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                                        {student.classModel ? student.classModel.name : 'Unassigned'}
                                    </span>
                                </div>
                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <CreditCard size={16} />
                                        <span>Current Balance:</span>
                                        <span className="font-bold text-slate-900 ml-auto">
                                            {/* Calculate balance from fee records */}
                                            {student.feeRecords?.reduce((sum, rec) => sum + rec.balance, 0)?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold uppercase rounded-lg hover:bg-slate-100 transition-colors">
                                    <FileText size={14} />
                                    Receipts
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg shadow hover:bg-indigo-700 transition-colors" onClick={() => alert("Payment gateway integration pending.")}>
                                    <CreditCard size={14} />
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 border-dashed p-12 text-slate-400">
                        <AlertCircle size={40} className="mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-600">No Children Linked</h3>
                        <p className="text-sm">Please contact the school administrator to link your account to your children.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;
