import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Loader2, Activity as ActivityIcon } from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import { Sidebar, Navbar } from './components/Navigation';
import InstallPWA from './components/InstallPWA';
import KuntauPayLogo from './components/KuntauPayLogo';
import ProtectedRoute from './components/ProtectedRoute'; // I'll move this too

// --- HEAVY VIEWS & COMPONENTS (Lazy Loaded for Lightweight Architecture) ---
const LandingPage = lazy(() => import('./views/LandingPage'));
const LoginPage = lazy(() => import('./views/LoginPage'));
import SuperAdminDashboard from './views/SuperAdminDashboard';
const BranchManagement = lazy(() => import('./views/BranchManagement'));
const SetupWizard = lazy(() => import('./views/SetupWizard'));
const DocumentVerification = lazy(() => import('./views/DocumentVerification'));

const Dashboard = lazy(() => import('./views/Dashboard'));
const ParentDashboard = lazy(() => import('./views/ParentDashboard'));
const RoleBasedRedirect = lazy(() => import('./views/Dashboard').then(module => ({ default: module.RoleBasedRedirect })));
const Students = lazy(() => import('./views/Students'));
const BulkUpload = lazy(() => import('./components/BulkUpload'));
const MiscFees = lazy(() => import('./components/MiscFees'));
const Scholarships = lazy(() => import('./components/Scholarships'));
const StaffManagement = lazy(() => import('./components/StaffManagement'));
const PayrollConsole = lazy(() => import('./components/PayrollConsole'));
const CommunicationHub = lazy(() => import('./components/CommunicationHub'));
const AdminSetup = lazy(() => import('./views/AdminSetup'));
const AuditLogs = lazy(() => import('./components/AuditLogs'));
const GlobalAuditFeed = lazy(() => import('./views/GlobalAuditFeed'));
const SupportHub = lazy(() => import('./views/SupportHub'));
const SupportRequest = lazy(() => import('./views/SupportRequest'));
const BenchmarkingDashboard = lazy(() => import('./views/BenchmarkingDashboard'));
const RevenueForecasting = lazy(() => import('./views/RevenueForecasting'));
const SecuritySettings = lazy(() => import('./components/SecuritySettings'));

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const AppInternal = () => {
    const [schoolId, setSchoolId] = useState(localStorage.getItem('activeSchoolId') || '');
    const [isInitialized, setIsInitialized] = useState(true);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Socket Setup for Real-time Revenue Sync — only when authenticated
    useEffect(() => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return; // Skip socket on landing/login pages

        const socketUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3001'
            ? import.meta.env.VITE_API_URL
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3001'
                : window.location.origin);

        const socket = io(socketUrl);
        socket.on('students_updated', () => setRefreshTrigger(prev => prev + 1));
        socket.on('payment_recorded', () => setRefreshTrigger(prev => prev + 1));
        return () => socket.disconnect();
    }, []);

    const handleSchoolChange = (newId) => {
        setSchoolId(newId);
        localStorage.setItem('activeSchoolId', newId);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s max wait

        fetch(`${API_BASE}/system/status`, { signal: controller.signal })
            .then(res => res.json())
            .then(status => {
                setIsInitialized(status.isInitialized);
                setCheckingStatus(false);
            })
            .catch(() => {
                // On timeout or network error, assume initialized so user isn't stuck
                setIsInitialized(true);
                setCheckingStatus(false);
            })
            .finally(() => clearTimeout(timeout));
    }, []);

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-slate-900 blur-3xl opacity-5 scale-150 rounded-full animate-pulse"></div>
                    <KuntauPayLogo size={100} className="relative z-10" />
                </div>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-slate-900 opacity-20" size={20} />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Node Initializing</p>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        }>
            <InstallPWA />
            <Routes>
                <Route path="/" element={<RoleBasedRedirect schoolId={schoolId} globalRefresh={refreshTrigger} />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<SetupWizard />} />
                
                <Route path="/*" element={
                    <ProtectedRoute>
                        <div className="flex min-h-screen bg-[#fdfdfd] relative antialiased">
                            <Sidebar isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                            
                            {isMobileMenuOpen && (
                                <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[25] lg:hidden animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} />
                            )}

                            <div className="flex-1 flex flex-col min-w-0 relative">
                                <Navbar schoolId={schoolId} onSchoolChange={handleSchoolChange} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                                    <div className="max-w-7xl mx-auto">
                                        <ErrorBoundary>
                                            <Routes>
                                                <Route path="/" element={<RoleBasedRedirect schoolId={schoolId} globalRefresh={refreshTrigger} />} />
                                                <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboard onSchoolChange={handleSchoolChange} /></ProtectedRoute>} />
                                                <Route path="/security" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SecuritySettings /></ProtectedRoute>} />
                                                <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN']}><AuditLogs schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/benchmarking" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><BenchmarkingDashboard /></ProtectedRoute>} />
                                                <Route path="/forecast" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR']}><RevenueForecasting schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/audit-universe" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><GlobalAuditFeed /></ProtectedRoute>} />
                                                <Route path="/support-hub" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SupportHub /></ProtectedRoute>} />
                                                <Route path="/parent" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentDashboard /></ProtectedRoute>} />
                                                
                                                <Route path="/students" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'BURSAR']}><Students schoolId={schoolId} globalRefresh={refreshTrigger} /></ProtectedRoute>} />
                                                <Route path="/bulk-upload" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><BulkUpload schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/misc-fees" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'BURSAR']}><MiscFees schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/scholarships" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><Scholarships schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/staff" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><StaffManagement schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/payroll" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'BURSAR']}><PayrollConsole schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/communication" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><CommunicationHub /></ProtectedRoute>} />
                                                <Route path="/admin-setup" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><AdminSetup schoolId={schoolId} /></ProtectedRoute>} />
                                                <Route path="/manage-branches" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}><BranchManagement /></ProtectedRoute>} />
                                                <Route path="/request-support" element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'BURSAR']}><SupportRequest /></ProtectedRoute>} />
                                                <Route path="/verify" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR']}><DocumentVerification /></ProtectedRoute>} />
                                                
                                                <Route path="*" element={<Navigate to="/" />} />
                                            </Routes>
                                        </ErrorBoundary>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </Suspense>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('FATAL SYSTEM CRASH:', error, errorInfo); }
    handleReset = () => {
        localStorage.clear();
        window.location.href = '/#/login';
    };
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 md:p-20 flex items-center justify-center min-h-[60vh]">
                    <div className="glass-card p-10 text-center max-w-xl shadow-xl">
                        <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center mx-auto text-white shadow-lg mb-6">
                            <ActivityIcon size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Node Disconnection</h2>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            The ecosystem encountered a fatal data mismatch during node synchronization. 
                            If this happened during Troubleshooting Mode, the target node might have incompatible state protocols.
                        </p>
                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-100 text-slate-900 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Retry Frame Sync</button>
                            <button onClick={this.handleReset} className="px-8 py-4 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/5">Execute Emergency Reset</button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const App = () => (
    <AuthProvider>
        <AppInternal />
    </AuthProvider>
);

export default App;
