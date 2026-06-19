import { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Phone, Mail, Loader2, ArrowUpRight, CheckCircle2, Trash2, Activity as ActivityIcon, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const BranchManagement = () => {
    const { token, user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', groupId: '' });
    const [isSaving, setIsSaving] = useState(false);

    const loadBranches = () => {
        setLoading(true);
        fetch(`${API_BASE}/branches?includeArchived=${showArchived}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setBranches(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadBranches();

        // If Super Admin, fetch organizations for the dropdown
        if (user?.role === 'SUPER_ADMIN') {
            fetch(`${API_BASE}/super-admin/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setOrganizations(data.organizations || []))
            .catch(err => console.error('Failed to load organizations', err));
        }
    }, [token, user, showArchived]);

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/branches`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            // Refresh branches list
            loadBranches();
            setShowModal(false);
            setFormData({ name: '', address: '', phone: '', email: '', groupId: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchiveToggle = async (id, currentStatus) => {
        const isArchived = currentStatus === 'archived';
        try {
            const res = await fetch(`${API_BASE}/branches/${id}/archive`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ archive: !isArchived })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            loadBranches();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteBranch = async (id, name) => {
        if (!confirm(`CRITICAL ACTION: Are you sure you want to PERMANENTLY DECOMMISSION "${name}"? \n\nThis will purge all associated students, faculty, and financial records. This action cannot be reversed.`)) return;
        
        try {
            const res = await fetch(`${API_BASE}/branches/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            // Refresh branches list
            setBranches(branches.filter(b => b.id !== id));
            alert(data.message);
        } catch (err) {
            alert(err.message);
        }
    };

    const [showBrandingModal, setShowBrandingModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [brandData, setBrandData] = useState({ primaryColor: '#4f46e5', secondaryColor: '#0f172a', receiptHeader: '', receiptFooter: '' });

    const handleUpdateBranding = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/branches/${selectedBranch.id}/branding`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(brandData)
            });
            if (res.ok) {
                setShowBrandingModal(false);
                loadBranches();
            }
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    if (loading) return <div className="p-20 text-center font-bold uppercase tracking-[4px] text-slate-400 animate-pulse">Loading Branch Matrix...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Headers and Main List... */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Branch Management</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 font-medium">Create and oversee your institutional locations</p>
                        {user?.role === 'SUPER_ADMIN' && (
                            <button 
                                onClick={() => setShowArchived(!showArchived)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${showArchived ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'}`}
                            >
                                {showArchived ? 'Showing All Nodes' : 'Show Archived Nodes'}
                            </button>
                        )}
                    </div>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN') && (
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="px-6 py-3.5 bg-primary-600 rounded-xl text-white font-bold uppercase text-[10px] tracking-[2px] hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/10 flex items-center gap-3 active:scale-95"
                    >
                        <Plus size={16} /> Add New Branch
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {branches.map((branch) => (
                    <div key={branch.id} className={`bg-white rounded-3xl p-8 sophisticated-shadow border transition-all group overflow-hidden relative ${branch.status === 'archived' ? 'opacity-60 border-slate-200 grayscale-[0.5]' : 'border-slate-100 hover:border-primary/30'}`}>
                        <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: branch.primaryColor + '10' }}></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${branch.status === 'archived' ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-primary'}`} style={branch.status !== 'archived' ? { color: branch.primaryColor } : {}}>
                                    <Building2 size={28} />
                                </div>
                                <div className="flex gap-2">
                                    {branch.status === 'archived' && (
                                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-bold uppercase tracking-widest">Archived</span>
                                    )}
                                    {branch.group && (
                                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[8px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
                                            {branch.group.name}
                                        </span>
                                    )}
                                    <div className="flex bg-slate-50 rounded-xl border border-slate-200 p-1">
                                        <button 
                                            onClick={() => { setSelectedBranch(branch); setBrandData({ primaryColor: branch.primaryColor || '#4f46e5', secondaryColor: branch.secondaryColor || '#0f172a', receiptHeader: branch.receiptHeader || '', receiptFooter: branch.receiptFooter || '' }); setShowBrandingModal(true); }}
                                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                                            title="Institutional Branding"
                                        >
                                            <Palette size={14} />
                                        </button>
                                        {user?.role === 'SUPER_ADMIN' && (
                                            <>
                                                <button 
                                                    onClick={() => handleArchiveToggle(branch.id, branch.status)}
                                                    className={`p-2 rounded-lg transition-colors border-l border-slate-200 ml-1 ${branch.status === 'archived' ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500'}`}
                                                    title={branch.status === 'archived' ? 'Restore Branch' : 'Archive Branch'}
                                                >
                                                    <ActivityIcon size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors border-l border-slate-200 ml-1"
                                                    title="Decommission Branch"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate">{branch.name}</h3>
                            <div className="space-y-3 mb-8">
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> {branch.address || 'Location Unspecified'}</p>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {branch.phone || 'N/A'}</p>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {branch.email || 'N/A'}</p>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branch.primaryColor || '#10b981' }}></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Node Active</span>
                                </div>
                                <button className="text-primary hover:text-primary-600 transition-colors" style={{ color: branch.primaryColor }}>
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Branding Modal */}
            {showBrandingModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-12 sophisticated-shadow relative">
                        <button onClick={() => setShowBrandingModal(false)} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Node Branding</h2>
                            <p className="text-slate-500 font-medium mt-1">Configure white-label parameters for <span className="text-primary font-bold uppercase">{selectedBranch?.name}</span></p>
                        </div>
                        <form onSubmit={handleUpdateBranding} className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Identity Color</label>
                                <div className="flex gap-4">
                                    <input type="color" value={brandData.primaryColor} onChange={e => setBrandData({...brandData, primaryColor: e.target.value})} className="h-14 w-14 rounded-xl border-none cursor-pointer" />
                                    <input value={brandData.primaryColor} onChange={e => setBrandData({...brandData, primaryColor: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary Accent</label>
                                <div className="flex gap-4">
                                    <input type="color" value={brandData.secondaryColor} onChange={e => setBrandData({...brandData, secondaryColor: e.target.value})} className="h-14 w-14 rounded-xl border-none cursor-pointer" />
                                    <input value={brandData.secondaryColor} onChange={e => setBrandData({...brandData, secondaryColor: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold" />
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipt Header Signature</label>
                                <input value={brandData.receiptHeader} onChange={e => setBrandData({...brandData, receiptHeader: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold" placeholder="e.g. Official Institutional Payment Receipt" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipt Footer / Terms</label>
                                <textarea rows={3} value={brandData.receiptFooter} onChange={e => setBrandData({...brandData, receiptFooter: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold" placeholder="Terms and conditions for payments..." />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary rounded-xl text-white font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                    Deploy Brand Vectors
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Existing Schools Modal... */}

            {showModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-12 sophisticated-shadow animate-in zoom-in-95 duration-400 relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900">Provision New Branch</h2>
                            <p className="text-slate-500 font-medium mt-1">Deploy a new institutional node to your organization</p>
                        </div>
                        <form onSubmit={handleCreateBranch} className="space-y-6">
                            {user?.role === 'SUPER_ADMIN' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign to Organization</label>
                                    <select 
                                        required 
                                        value={formData.groupId} 
                                        onChange={e => setFormData({...formData, groupId: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select an Organization</option>
                                        {organizations.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch Name</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. North Side Campus" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
                                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Enter physical location" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+234..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="branch@school.edu" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-primary-600 rounded-2xl text-white font-bold uppercase text-xs tracking-widest hover:bg-primary-500 transition-all flex items-center justify-center gap-3 glow-button">
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    Deploy Node
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
