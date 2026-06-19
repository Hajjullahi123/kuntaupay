import { useState, useEffect } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const BranchSwitcher = ({ currentSchoolId, onSwitch }) => {
    const [branches, setBranches] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;
        const { user } = JSON.parse(localStorage.getItem('user') || '{}');
        
        const fetchUrl = user?.role === 'SUPER_ADMIN' 
            ? `${API_BASE}/super-admin/summary` 
            : `${API_BASE}/branches`;

        fetch(fetchUrl, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (user?.role === 'SUPER_ADMIN') {
                    // Flatten all schools from all organizations
                    const allSchools = (data.organizations || []).flatMap(org => org.schools || []);
                    setBranches(allSchools);
                } else {
                    setBranches(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => console.error('Error fetching branches:', err));
    }, [token]);

    const currentBranch = branches.find(b => b.id === parseInt(currentSchoolId)) || branches[0];

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl hover:border-primary transition-all group shadow-sm"
            >
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <Building2 size={16} />
                </div>
                <div className="text-left hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Active Branch</p>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{currentBranch?.name || 'Loading...'}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 rounded-2xl shadow-xl">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select School Branch</p>
                    </div>
                    {branches.map(branch => (
                        <button
                            key={branch.id}
                            onClick={() => {
                                onSwitch(branch.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                branch.id === currentSchoolId 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                        >
                            <span className="text-sm font-bold">{branch.name}</span>
                            {branch.id === currentSchoolId && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BranchSwitcher;
