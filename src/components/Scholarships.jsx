import { useState, useEffect } from 'react'
import { GraduationCap, Award, Search, Loader2, Calendar } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const Scholarships = ({ schoolId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/scholarships`, { headers: { 'x-school-id': schoolId } })
            .then(res => res.json())
            .then(data => {
                setStudents(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [schoolId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Beneficiary Tracking</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage scholarship recipients and digital certificate disbursement</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-card p-6 bg-primary/5 border-primary/20 bg-white sophisticated-shadow">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[3px]">Total Beneficiaries</p>
                        <h4 className="text-3xl font-black mt-2 text-slate-900">{students.length}</h4>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholarship %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificates</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                    <GraduationCap size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{s.admissionNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-primary">
                                            {s.scholarshipPercentage || 0}%
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2">
                                                {s.scholarshipCertificates?.length > 0 ? (
                                                    s.scholarshipCertificates.map(cert => (
                                                        <span key={cert.id} className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[9px] font-black uppercase tracking-tighter border border-gold/10">
                                                            {cert.certificateNumber}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-600 font-bold italic">No active certificates</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                                Issue Certificate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scholarships;
