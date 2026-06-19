import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, Zap, ArrowRight, BarChart3, Users, Globe, Lock, Cpu, Star, Activity, Smartphone, Menu, X, BookOpen, GraduationCap, Award, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import KuntauPayLogo from '../components/KuntauPayLogo';

const LandingPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBtn(false);
            setDeferredPrompt(null);
        }
    };

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Security', href: '#security' },
        { label: 'Why Us', href: '#why-us' },
    ];

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-900 selection:bg-primary-500/30 selection:text-primary-900 overflow-x-hidden relative font-['Outfit']">
            
            {/* ═══════════ Sophisticated Mesh Background ═══════════ */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Modern Mesh Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#e0f2fe_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#ede9fe_0%,transparent_40%),radial-gradient(circle_at_50%_50%,#f0f9ff_0%,transparent_60%)]" />
                
                {/* Animated Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-400/20 blur-[100px] rounded-full animate-bounce-slow" />
                
                {/* Preloaded Static Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
                    style={{ 
                        backgroundImage: `url('/images/hero_light_3.png')`,
                        filter: 'contrast(110%) saturate(120%)',
                    }}
                />
                
                {/* Watermark Logo Background */}
                <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <img src="/images/school_logo_transparent.png" alt="Watermark Logo" className="w-[80vw] max-w-[800px] object-contain grayscale mix-blend-multiply opacity-[0.05]" />
                </div>
                
                {/* Soft Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-slate-200/40" />
                
                {/* Premium Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
                        backgroundSize: '64px 64px',
                    }}
                />
            </div>

            {/* ═══════════ Premium Navbar ═══════════ */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-md' : 'py-4 md:py-6 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <KuntauPayLogo size={scrolled ? 36 : 42} className="group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a key={link.label} href={link.href} className="text-[11px] font-black uppercase tracking-[3px] text-slate-500 hover:text-primary-600 transition-colors relative group">
                                {link.label}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 group-hover:w-full rounded-full" />
                            </a>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {showInstallBtn && (
                            <button onClick={handleInstall} className="px-4 py-2.5 bg-primary-600/5 border border-primary-600/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary-600 flex items-center gap-2 hover:bg-primary-600/10 transition-all">
                                <Smartphone size={14} /> Install App
                            </button>
                        )}
                        <button onClick={() => navigate('/login')} className="text-[11px] font-black uppercase tracking-[2px] text-slate-500 hover:text-slate-900 transition-all px-4 py-2.5">Client Portal</button>
                        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-600/20 transition-all hover:scale-105 active:scale-95">
                            Executive Login
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                        className="md:hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-200 transition-all"
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 py-6 space-y-2">
                        {navLinks.map((link) => (
                            <a 
                                key={link.label} 
                                href={link.href} 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3.5 text-[11px] font-black uppercase tracking-[3px] text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="h-px bg-slate-100 my-4" />
                        <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full px-4 py-3.5 text-[11px] font-black uppercase tracking-[2px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
                            Client Portal
                        </button>
                        <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full px-4 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-primary-600 transition-all shadow-xl text-center">
                            Executive Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══════════ Hero Section ═══════════ */}
            <main className="relative z-10 pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
                <div className="text-center max-w-5xl w-full">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-md mb-8 sm:mb-10 landing-fade-up shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] text-slate-500">Kuntau Ecosystem V2.4</span>
                        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
                        <Award size={12} className="text-primary-600 hidden sm:block" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] text-primary-600 hidden sm:block">Enterprise</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[110px] font-black tracking-tighter leading-[0.9] mb-6 sm:mb-8 md:mb-10 landing-fade-up landing-delay-1 text-slate-900">
                        Kuntau <br className="sm:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-violet-600 to-indigo-600">
                            Pay:
                        </span>
                        <br />
                        <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[85px] text-slate-500">
                            Future of Education
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10 sm:mb-14 md:mb-16 px-2 landing-fade-up landing-delay-2">
                        Experience the gold standard in school management. A high-performance, multi-tenant financial engine built to scale with your institution's growth.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center landing-fade-up landing-delay-3">
                        <button 
                            onClick={() => navigate('/login')} 
                            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-slate-900 rounded-2xl sm:rounded-3xl font-black uppercase text-xs sm:text-sm tracking-[2px] sm:tracking-[3px] text-white hover:bg-primary-600 transition-all shadow-[0_20px_50px_-10px_rgba(15,23,42,0.15)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            Enter Secure Portal <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        
                        <button 
                            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl font-black uppercase text-xs sm:text-sm tracking-[2px] sm:tracking-[3px] text-slate-900 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 group"
                        >
                            Explore Platform <Globe size={18} className="group-hover:rotate-180 transition-all duration-1000 text-primary-500" />
                        </button>
                    </div>
                </div>

                {/* ═══════════ Dashboard Preview Card (Light Mode Refined) ═══════════ */}
                <div className="mt-16 sm:mt-24 md:mt-32 w-full max-w-6xl relative group cursor-pointer landing-fade-up landing-delay-4">
                    <div className="absolute inset-x-10 sm:inset-x-20 -top-10 h-32 bg-primary-400/10 blur-[120px] group-hover:bg-primary-400/20 transition-all duration-1000" />
                    <div className="relative rounded-2xl sm:rounded-[32px] md:rounded-[48px] border border-slate-200 p-2 sm:p-3 md:p-5 bg-white/40 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden group-hover:border-primary-200 transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent pointer-events-none" />
                        
                        {/* Simulated UI Content */}
                        <div className="bg-white rounded-xl sm:rounded-[24px] md:rounded-[40px] p-4 sm:p-6 md:p-10 border border-slate-100 shadow-inner">
                            {/* Window Controls */}
                            <div className="h-6 w-full flex items-center gap-2 mb-6 sm:mb-8 md:mb-10 border-b border-slate-50 pb-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
                                <div className="flex-1 flex justify-center">
                                    <div className="h-5 w-64 bg-slate-50 rounded-full border border-slate-100 hidden sm:block" />
                                </div>
                            </div>
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
                                {[
                                    { label: 'Total Revenue', value: '₦14.2M', color: 'primary', icon: TrendingUp },
                                    { label: 'Students', value: '2,847', color: 'emerald', icon: Users },
                                    { label: 'Collection', value: '94.2%', color: 'amber', icon: Activity },
                                    { label: 'Branches', value: '12', color: 'violet', icon: Building2 },
                                ].map((card, i) => (
                                    <div key={i} className={`h-auto p-4 sm:p-6 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center text-center group-hover:bg-white transition-all duration-500 group-hover:shadow-lg group-hover:shadow-slate-200/50`} style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-${card.color}-500 mb-4 shadow-sm`}>
                                            <card.icon size={20} />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
                                        <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">{card.value}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Chart Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                                <div className="lg:col-span-2 h-52 sm:h-64 md:h-80 bg-slate-50/30 rounded-2xl sm:rounded-[32px] border border-slate-100 p-6 sm:p-8 flex flex-col">
                                    <div className="flex justify-between mb-8 sm:mb-12">
                                        <div className="h-6 w-48 bg-slate-100 rounded-full" />
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 bg-white border border-slate-100 rounded-lg shadow-sm" />
                                            <div className="h-8 w-8 bg-white border border-slate-100 rounded-lg shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-2 sm:gap-3 md:gap-4 px-4">
                                        {[40, 65, 45, 90, 85, 55, 75, 45, 60, 95, 70, 80].map((h, i) => (
                                            <div 
                                                key={i} 
                                                className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400/40 rounded-full transition-all duration-700 hover:from-primary-600" 
                                                style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden lg:block col-span-1 h-80 bg-slate-50/30 rounded-[32px] border border-slate-100 p-8 space-y-6">
                                    <div className="h-6 w-32 bg-slate-100 rounded-full mb-8" />
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex items-center gap-4 group/item">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0 flex items-center justify-center text-slate-400 group-hover/item:text-primary-500 transition-colors">
                                                <Award size={18} />
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 w-full bg-slate-100 rounded-full" />
                                                <div className="h-2 w-2/3 bg-slate-50 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════ Performance Stats ═══════════ */}
                <div id="security" className="mt-24 sm:mt-32 md:mt-48 grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 md:gap-24 max-w-5xl w-full px-4">
                    {[
                        { icon: Activity, label: 'Execution Speed', value: '42ms', color: 'primary' },
                        { icon: Lock, label: 'Security Grade', value: 'AES-256', color: 'emerald' },
                        { icon: Users, label: 'Active Nodes', value: '1.4k+', color: 'violet' },
                        { icon: BarChart3, label: 'System Uptime', value: '99.99%', color: 'amber' }
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center text-${s.color}-500 mb-6 group-hover:scale-110 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-${s.color}-500/10`}>
                                <s.icon size={28} />
                            </div>
                            <h4 className="text-2xl sm:text-3xl md:text-5xl font-black mb-1 sm:mb-2 text-slate-900 tracking-tight">{s.value}</h4>
                            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[3px] text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ═══════════ Features Grid ═══════════ */}
                <div id="features" className="mt-24 sm:mt-32 md:mt-48 max-w-6xl w-full">
                    <div className="text-center mb-16 sm:mb-20 md:mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-100 bg-primary-50/50 mb-6">
                            <Zap size={14} className="text-primary-600" />
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-primary-700">Capabilities</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900">
                            Enterprise <span className="text-primary-600">Precision</span>,<br />
                            Academic Excellence.
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto px-4">
                            Built from the ground up for multi-branch institutions that demand the absolute highest standards in financial reporting and automation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
                        {[
                            { icon: Building2, title: 'Multi-Branch', desc: 'Control unlimited branches from a central hub with real-time data sync.', color: 'primary' },
                            { icon: ShieldCheck, title: 'Secure Receipts', desc: 'Tamper-proof digital receipts with unique cryptographic verification.', color: 'emerald' },
                            { icon: Users, title: 'Student 360', desc: 'Unified view of student financials, attendance, and academic history.', color: 'violet' },
                            { icon: BarChart3, title: 'Smart Analytics', desc: 'Proactive collection alerts and automated revenue forecasting.', color: 'amber' },
                            { icon: GraduationCap, title: 'Scholarships', desc: 'Advanced scholarship management and automated fee adjustments.', color: 'rose' },
                            { icon: Cpu, title: 'Payroll Engine', desc: 'Automated staff salary processing with automated tax calculations.', color: 'cyan' },
                        ].map((feature, i) => (
                            <div 
                                key={i} 
                                className={`relative p-8 sm:p-10 rounded-[40px] bg-white border border-slate-100 hover:border-primary-200 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-600/5`}
                            >
                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 flex items-center justify-center text-${feature.color}-600 mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon size={26} />
                                    </div>
                                    <h3 className="text-xl font-black mb-4 text-slate-900 tracking-tight">{feature.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══════════ Why Us Section ═══════════ */}
                <div id="why-us" className="mt-24 sm:mt-32 md:mt-48 max-w-6xl w-full px-4 sm:px-0 mb-16">
                    <div className="relative rounded-[48px] overflow-hidden bg-slate-900 text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#3b82f640,transparent_50%),radial-gradient(circle_at_0%_100%,#8b5cf630,transparent_50%)]" />
                        <div className="relative p-10 sm:p-16 md:p-24">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
                                        <Award size={14} className="text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Excellence</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
                                        Engineered for<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">Elite Performance</span>
                                    </h2>
                                    <p className="text-lg text-slate-400 leading-relaxed mb-12 font-medium">
                                        Join 1,400+ institutions that trust Kuntau-Pay to handle their most critical financial operations with zero downtime.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/login')} 
                                        className="px-10 py-5 bg-white text-slate-900 rounded-3xl text-sm font-black uppercase tracking-[2px] hover:bg-primary-500 hover:text-white transition-all shadow-2xl flex items-center gap-3 group"
                                    >
                                        Start Your Journey <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { title: 'Military-Grade Security', desc: 'AES-256 encryption for all sensitive school and student data.' },
                                        { title: 'Zero-Latency Sync', desc: 'Real-time database propagation across all branch locations.' },
                                        { title: 'Granular Permissions', desc: 'Precision control over every action within the ecosystem.' },
                                        { title: 'Verifiable Auditing', desc: 'Every transaction leaves a permanent, immutable digital footprint.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black mb-2 text-white">{item.title}</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══════════ Footer ═══════════ */}
            <footer className="relative z-10 border-t border-slate-200/50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-4">
                            <KuntauPayLogo size={32} />
                            <div className="h-6 w-px bg-slate-200" />
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Established 2026</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-500 text-center">
                            &copy; Kuntau-Pay Ecosystems. Premium School Management.
                        </p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">Privacy</a>
                            <a href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ═══════════ CSS Animations & Utilities ═══════════ */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes landingFadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                .animate-bounce-slow {
                    animation: bounceSlow 8s ease-in-out infinite;
                }

                .landing-fade-up {
                    animation: landingFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                .landing-delay-1 { animation-delay: 0.1s; }
                .landing-delay-2 { animation-delay: 0.2s; }
                .landing-delay-3 { animation-delay: 0.3s; }
                .landing-delay-4 { animation-delay: 0.4s; }

                .logo-white-text { filter: none !important; }
            `}} />
        </div>
    );
};


export default LandingPage;
