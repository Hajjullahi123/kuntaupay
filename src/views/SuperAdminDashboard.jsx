import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Users, BarChart3, ArrowUpRight, Loader2, Search, UserCheck, ShieldCheck, Mail, Phone, MapPin, X, Trash2, Globe, Key, CreditCard, Activity as ActivityIcon } from 'lucide-react';
import { apiFetch } from '../utils/api';
import KuntauPayLogo from '../components/KuntauPayLogo';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SuperAdminDashboard = ({ onSchoolChange }) => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('orgs');
    
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [orgData, setOrgData] = useState({ name: '', adminFirstName: '', adminLastName: '', adminUsername: '', adminPassword: '' });
    const [userData, setUserData] = useState({ username: '', firstName: '', lastName: '', role: 'SCHOOL_ADMIN', password: '', schoolId: '', admissionNumber: '', classId: '' });
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [resetCreds, setResetCreds] = useState(null);

    const [showBranchModal, setShowBranchModal] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [branchData, setBranchData] = useState({ name: '', address: '', phone: '', email: '' });
    const { login } = useAuth();

    const loadData = () => {
        setLoading(true);
        setError(null);
        
        Promise.all([
            apiFetch(`${API_BASE}/super-admin/summary`),
            apiFetch(`${API_BASE}/super-admin/users`)
        ])
        .then(async ([sRes, uRes]) => {
            if (sRes.status === 401 || uRes.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            const sumData = await sRes.json();
            const userData = await uRes.json();
            
            if (sumData.error || userData.error) {
                throw new Error(sumData.error || userData.error);
            }

            setSummary(sumData);
            setOrganizations(sumData.organizations || []);
            setUsers(userData);
            setLoading(false);
        })
        .catch(err => {
            console.error('SuperAdmin load error:', err);
            setError(err.message);
            setLoading(false);
        });
    };

    const handleImpersonate = async (schoolId) => {
        try {
            const res = await fetch(`${API_BASE}/super-admin/impersonate/${schoolId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Create a robust pseudo-user object from current auth state
            const impersonatedUser = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                role: 'SCHOOL_ADMIN',
                schoolId: data.school.id,
                groupId: data.school.groupId,
                isImpersonating: true,
                originalRole: 'SUPER_ADMIN'
            };
            
            login(data.token, impersonatedUser);
            onSchoolChange(data.school.id);
            navigate('/'); // Jump to the operational dashboard
        } catch (err) { alert(err.message); }
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/super-admin/organizations/${selectedOrgId}/schools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(branchData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowBranchModal(false);
            setBranchData({ name: '', address: '', phone: '', email: '' });
            loadData();
        } catch (err) { alert(err.message); }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/super-admin/organizations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    orgName: orgData.name,
                    adminFirstName: orgData.adminFirstName,
                    adminLastName: orgData.adminLastName,
                    adminUsername: orgData.adminUsername,
                    adminPassword: orgData.adminPassword
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCreatedCredentials(data);
            setShowOrgModal(false);
        } catch (err) { alert(err.message); }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm('Are you sure you want to REGENERATE credentials for this user?')) return;
        try {
            const res = await fetch(`${API_BASE}/super-admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResetCreds(data);
        } catch (err) { alert(err.message); }
    };

    const handleDeleteSchool = async (schoolId, name) => {
        if (!confirm(`CRITICAL ACTION: Are you sure you want to PERMANENTLY TERMINATE "${name}"?\n\nThis will erase all students, fee records, and branch data.`)) return;
        try {
            const res = await apiFetch(`${API_BASE}/super-admin/schools/${schoolId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            loadData();
        } catch (err) { alert(err.message); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/super-admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowUserModal(false);
            loadData();
        } catch (err) { alert(err.message); }
    };

    if (error) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-12 text-center max-w-lg">
                    <p className="text-rose-500 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Core Sync Error</p>
                    <p className="text-slate-900 font-bold mb-8 leading-relaxed">{error}</p>
                    <button onClick={loadData} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Retry Universal Sync</button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="space-y-12 py-10 animate-in fade-in duration-1000 max-w-7xl mx-auto px-4">
            <div className="flex flex-col gap-4">
                <div className="h-12 w-64 skeleton"></div>
                <div className="h-4 w-96 skeleton opacity-50"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-40 glass-card skeleton"></div>)}
            </div>
            <div className="h-96 glass-card skeleton"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto px-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary-500 uppercase tracking-[4px] mb-3">
                        <ShieldCheck size={14} /> System Administrator Access
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Global School Network</h1>
                    <p className="text-slate-500 font-medium mt-3">You are overseeing {summary?.organizationCount} school groups and {summary?.totalSchools} active branches.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowOrgModal(true)} className="px-10 py-5 bg-slate-900 rounded-2xl text-white font-black uppercase text-[11px] tracking-[2px] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center transition-all group-hover:rotate-90">
                           <Plus size={18} />
                        </div>
                        Register New School Group
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Globe, label: 'Total School Groups', value: summary?.organizationCount, color: 'text-primary' },
                    { icon: CreditCard, label: 'Total Money Received Globally', value: `₦${(summary?.globalStats?.totalCollected || 0).toLocaleString()}`, color: 'text-emerald-500' },
                    { icon: ArrowUpRight, label: 'Total Outstanding Owed', value: `₦${(summary?.globalStats?.totalOwed || 0).toLocaleString()}`, color: 'text-rose-500' },
                    { icon: Users, label: 'Total Students in All Schools', value: summary?.organizations?.reduce((acc, o) => acc + (o.studentCount || 0), 0), color: 'text-gold' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 sophisticated-shadow bg-white transition-all cursor-default relative overflow-hidden group">
                        <div className={`p-3 rounded-2xl bg-slate-50 w-fit mb-6 ${s.color}`}>
                            <s.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <h4 className="text-3xl font-black text-slate-900 mt-2 truncate">{s.value}</h4>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button 
                  onClick={() => setActiveTab('orgs')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orgs' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Manage School Groups
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  System Users & Staff
                </button>
            </div>

            <div className="glass-card overflow-hidden bg-white sophisticated-shadow border-slate-200">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-xl text-slate-900 uppercase tracking-tight">
                      {activeTab === 'orgs' ? 'List of Registered School Groups' : 'List of Staff & Administrators'}
                    </h3>
                </div>
                
                {activeTab === 'orgs' ? (
                  <div className="divide-y divide-slate-100">
                      {organizations.map(org => (
                          <div key={org.id} className="p-8 hover:bg-slate-50/30 transition-all">
                              <div className="flex items-center justify-between mb-8">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-400 ring-1 ring-inset ring-slate-200 shadow-sm">
                                          <Globe size={28} />
                                      </div>
                                      <div>
                                          <p className="text-xl font-black text-slate-900 line-clamp-1">{org.name}</p>
                                          <div className="flex items-center gap-3 mt-1">
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Total Revenue Collected: ₦{org.totalRevenue?.toLocaleString()}</p>
                                            <span className="text-slate-300">•</span>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{org.studentCount || 0} Total Students</p>
                                          </div>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => { setSelectedOrgId(org.id); setShowBranchModal(true); }}
                                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                                  >
                                      <Plus size={14} /> Add New Branch
                                  </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-14">
                                  {(org.schools || []).map(school => (
                                      <div key={school.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-slate-400 transition-all group shadow-sm hover:shadow-xl">
                                          <div className="flex items-center justify-between mb-6">
                                              <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                  <Building2 size={22} className="text-slate-500 group-hover:text-white" />
                                              </div>
                                              <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleImpersonate(school.id)}
                                                    className="text-[10px] font-black uppercase tracking-[2px] text-slate-900 hover:text-white transition-all bg-slate-100 hover:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200"
                                                >
                                                    Login
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteSchool(school.id, school.name)}
                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Terminate Branch"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                              </div>
                                          </div>
                                          <p className="text-[15px] font-black text-slate-950 uppercase tracking-tight line-clamp-1">{school.name}</p>
                                          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{school._count?.students || 0} Instances</p>
                                              <p className="text-[10px] px-3 py-1 bg-emerald-50 rounded-lg text-emerald-700 font-black uppercase tracking-widest border border-emerald-100">Live</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] border-b border-slate-100 bg-slate-50/30">
                            <th className="px-8 py-5">Administrator</th>
                            <th className="px-8 py-5">Organization</th>
                            <th className="px-8 py-5 text-right">Interaction</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-7">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                            <img src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=f1f5f9&color=0e6ae9&bold=true`} alt="entity" className="w-full h-full rounded-xl object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-md font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{user.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <p className="text-xs font-black text-primary-600 uppercase tracking-widest">{user.group?.name || 'Local Instance'}</p>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <button 
                                        onClick={() => handleResetPassword(user.id)}
                                        className="p-3 rounded-xl hover:bg-primary-600/10 text-slate-400 hover:text-primary-600 transition-all"
                                    >
                                        <Key size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                )}
            </div>

            {showBranchModal && (
                <Modal title="Provision New Branch" onClose={() => setShowBranchModal(false)}>
                    <form className="space-y-6" onSubmit={handleCreateBranch}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Branch Name</label>
                            <input required className="input-field" placeholder="Excellence International (Primary)" value={branchData.name} onChange={e => setBranchData({...branchData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Address</label>
                            <textarea required className="input-field h-24" placeholder="Full physical address of the branch" value={branchData.address} onChange={e => setBranchData({...branchData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                                <input required className="input-field" placeholder="+234..." value={branchData.phone} onChange={e => setBranchData({...branchData, phone: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                                <input required className="input-field" type="email" placeholder="branch@school.edu" value={branchData.email} onChange={e => setBranchData({...branchData, email: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowBranchModal(false)} className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                            <button type="submit" className="btn-primary flex-1 shadow-2xl">Provision Branch</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showOrgModal && (
                <Modal title="Provision New Organization" onClose={() => setShowOrgModal(false)}>
                  <form className="space-y-6" onSubmit={handleCreateOrg}>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Name</label>
                          <input required className="input-field" placeholder="Excellence School Group" onChange={e => setOrgData({...orgData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Head Master First Name</label>
                            <input required className="input-field" placeholder="Ahmad" onChange={e => setOrgData({...orgData, adminFirstName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Head Master Last Name</label>
                            <input required className="input-field" placeholder="Ibrahim" onChange={e => setOrgData({...orgData, adminLastName: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Username</label>
                            <input required className="input-field" placeholder="admin.excellence" onChange={e => setOrgData({...orgData, adminUsername: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label>
                            <input className="input-field" type="password" placeholder="Leave empty for default" onChange={e => setOrgData({...orgData, adminPassword: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setShowOrgModal(false)} className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                          <button type="submit" className="btn-primary flex-1 shadow-2xl">Deploy Organization</button>
                      </div>
                  </form>
                </Modal>
            )}

            {createdCredentials && (
                <Modal title="Organization Provisioned" onClose={() => { setCreatedCredentials(null); loadData(); }}>
                    <div className="space-y-8 p-8 border-2 border-dashed border-emerald-100 rounded-[32px] bg-emerald-50/30 print:border-none print:bg-white print:block print:p-0">
                        <header className="text-center space-y-4">
                             <div className="flex justify-center mb-8">
                                 <KuntauPayLogo size={80} stacked={true} />
                             </div>
                             <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg print:shadow-none">
                                 <ShieldCheck size={32} />
                             </div>
                             <h4 className="text-2xl font-black text-slate-900 mt-4 leading-tight">Master Admin Account Initialized</h4>
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px]">Secure Credentials for Organization Head</p>
                        </header>

                        <div className="space-y-5 print:max-w-xl print:mx-auto print:w-full">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 print:shadow-none print:border-slate-200">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Organization</p>
                                <p className="text-xl font-black text-slate-900">{createdCredentials.group.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 print:shadow-none print:border-slate-200">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Username</p>
                                    <p className="text-sm font-black text-primary-600 break-all">{createdCredentials.admin.username}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 print:shadow-none print:border-slate-200">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Password</p>
                                    <p className="text-lg font-black text-emerald-600 tracking-tighter uppercase">{createdCredentials.tempPassword}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => window.print()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 print:hidden">
                            <ArrowUpRight size={18} /> Print Secure Credentials
                        </button>
                    </div>
                </Modal>
            )}

            {resetCreds && (
                <Modal title="Password Reset Protocol" onClose={() => setResetCreds(null)}>
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center mx-auto text-primary-600 mb-6">
                            <Key size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">New temporary credentials for <span className="text-slate-900 font-bold">{resetCreds.username}</span></p>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                            <p className="text-3xl font-black text-primary-600 uppercase tracking-tighter">{resetCreds.tempPassword}</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300 print:absolute print:inset-0 print:bg-white print:block">
      <div className="glass-card w-full max-w-xl p-12 sophisticated-shadow bg-white animate-in zoom-in-95 duration-400 shadow-2xl relative max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:block">
          <button onClick={onClose} className="absolute right-8 top-8 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm print:hidden">
            <X size={20} />
          </button>
          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm font-medium">Configure ecosystem node with universal parameters</p>
          </div>
          {children}
      </div>
  </div>
);

export default SuperAdminDashboard;
