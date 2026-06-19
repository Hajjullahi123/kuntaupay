import { useState, useEffect } from 'react';
import { Smartphone, Download, X, ShieldCheck, Sparkles } from 'lucide-react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Only show if we are on a mobile/tablet screen and not yet installed
            if (window.innerWidth < 1024) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setIsVisible(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible || !isMobile) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-700">
            <div className="bg-slate-900 border-b border-primary/20 shadow-2xl relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,#e11d48_0%,transparent_50%)]"></div>
                
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group group-hover:scale-110 transition-transform">
                            <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight uppercase">Enhance Your Experience</p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-emerald-500" /> Install Kuntau-Pay Mobile App for Secure Offline Access
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleInstallClick}
                            className="bg-primary hover:bg-rose-500 px-6 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                        >
                            <Download size={14} /> Install Now
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;
