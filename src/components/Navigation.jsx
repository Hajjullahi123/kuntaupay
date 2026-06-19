import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Users, Download, CreditCard, GraduationCap, MessageSquare, Building2, Settings as SettingsIcon, LogOut, Menu, Activity as ActivityIcon, TrendingUp, Briefcase, Wallet, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import BranchSwitcher from './BranchSwitcher';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const Sidebar = ({ isOpen, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Revenue', icon: LayoutDashboard, path: '/', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Forecast', icon: TrendingUp, path: '/forecast', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Governance', icon: ShieldCheck, path: '/super-admin', roles: ['SUPER_ADMIN'] },
        { name: 'Students', icon: Users, path: '/students', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Misc Fees', icon: Wallet, path: '/misc-fees', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Scholarships', icon: GraduationCap, path: '/scholarships', roles: ['SCHOOL_ADMIN'] },
        { name: 'Staff', icon: Briefcase, path: '/staff', roles: ['SCHOOL_ADMIN'] },
        { name: 'Payroll', icon: CreditCard, path: '/payroll', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Comms', icon: MessageSquare, path: '/communication', roles: ['SCHOOL_ADMIN'] },
        { name: 'Verify', icon: ShieldCheck, path: '/verify', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'Branches', icon: Building2, path: '/manage-branches', roles: ['SCHOOL_ADMIN'] },
        { name: 'Audit', icon: ActivityIcon, path: '/audit-logs', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
        { name: 'Setup', icon: SettingsIcon, path: '/admin-setup', roles: ['SCHOOL_ADMIN'] },
        { name: 'Support', icon: LifeBuoy, path: '/request-support', roles: ['SCHOOL_ADMIN', 'BURSAR'] },
        { name: 'My Children', icon: Users, path: '/parent', roles: ['PARENT'] },
    ];

    const visibleItems = menuItems.filter(item => user && item.roles.includes(user.role));

    return (
        <aside className={`fixed inset-y-0 left-0 w-64 md:static md:block transform transition-all duration-500 z-30 flex flex-col glass-sidebar ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:translate-x-0 opacity-0 md:opacity-100'}`}>
            <div className="p-8">
                <div className="cursor-pointer group flex items-center gap-3" onClick={() => { navigate('/'); onToggle?.(); }}>
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-lg shadow-slate-900/5">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[11px] uppercase tracking-[0.15em] text-slate-900">
                           Kuntau-Pay
                        </h2>
                        <p className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-[0.08em] font-bold">
                           School Finance System
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-2 px-6 overflow-y-auto custom-scrollbar">
                {visibleItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => { navigate(item.path); onToggle?.(); }}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <item.icon size={16} />
                        {item.name}
                    </button>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl border border-slate-100"
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export const Navbar = ({ schoolId, onSchoolChange, onMenuToggle }) => {
    const { user, token } = useAuth();
    const [period, setPeriod] = useState({ session: '...', term: '...' });

    useEffect(() => {
        if (!schoolId || user?.role === 'SUPER_ADMIN') return;

        fetch(`${API_BASE}/super-admin/academic-periods?schoolId=${schoolId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return;
                const s = data.find(s => s.isCurrent);
                const t = s?.terms.find(t => t.isCurrent);
                setPeriod({ session: s?.name || 'N/A', term: t?.name || 'N/A' });
            })
            .catch(err => console.error('Navbar period fetch error:', err));
    }, [schoolId, user?.role, token]);

    return (
        <nav className="h-20 px-6 md:px-10 flex items-center justify-between glass-navbar z-20">
            <div className="flex items-center gap-6 flex-1">
                <button 
                    onClick={onMenuToggle}
                    className="md:hidden p-4 bg-white border border-slate-100 rounded-2xl text-slate-900 shadow-sm"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden xl:flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-900/5 border border-slate-900/5 rounded-full text-[8.5px] font-bold text-slate-900 flex items-center gap-2.5 uppercase tracking-[0.15em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {user?.role === 'SUPER_ADMIN' ? 'System Admin' : 'Active Session'}
                    </div>
                </div>

                <div className="flex-1 max-w-xs">
                    {!user?.isImpersonating && (
                        <BranchSwitcher currentSchoolId={schoolId} onSwitch={onSchoolChange} />
                    )}
                    {user?.isImpersonating && (
                        <div className="flex items-center gap-4">
                           <div className="px-5 py-2 bg-rose-500 text-white rounded-full text-[8.5px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-rose-500/10 animate-pulse">
                                Troubleshooting Mode
                           </div>
                           <button 
                             onClick={() => {
                                 const originalUser = { ...user, role: 'SUPER_ADMIN', isImpersonating: false, schoolId: null };
                                 // We need a better way to restore the token, but for now, let's just trigger a re-login or reset
                                 localStorage.removeItem('token');
                                 localStorage.removeItem('user');
                                 window.location.href = '/#/login';
                             }}
                             className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                           >
                             Exit
                           </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-8 ml-6">
                {user?.role !== 'SUPER_ADMIN' && (
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Epoch</p>
                        <p className="text-[9px] font-bold text-slate-900 px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg tracking-wide uppercase">{period.session} • {period.term}</p>
                    </div>
                )}
                
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100 relative group cursor-pointer">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`} className="w-7 h-7 rounded-lg" alt="Profile" />
                    <div className="absolute right-0 top-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        </nav>
    );
};
