import { QRCodeSVG } from 'qrcode.react';
import { User, ShieldCheck, Building2, Smartphone, ShieldAlert, Award } from 'lucide-react';

const StaffSmartCard = ({ staff }) => {
    if (!staff) return null;

    const handlePrint = () => {
        const content = document.getElementById(`smart-card-${staff.id}`).innerHTML;
        const win = window.open('', '', 'height=600,width=840');
        win.document.write(`
            <html>
                <head>
                    <title>Staff Smart Identity - ${staff.firstName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@900&display=swap');
                        body { background: #f8fafc; padding: 50px; display: flex; justify-content: center; }
                        .card-outer { width: 85.6mm; height: 53.98mm; background: #0f172a; border-radius: 4mm; color: white; padding: 0; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
                        .card-inner { padding: 4mm; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10; }
                        .mesh-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 100% 0%, #1e293b 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1e293b 0%, transparent 50%); opacity: 0.5; }
                        .accent-line { position: absolute; top: 0; left: 0; width: 100%; h-1mm; background: #fbbf24; }
                        .header { display: flex; justify-content: space-between; align-items: start; }
                        .school-name { font-size: 3mm; font-weight: 900; letter-spacing: 0.5mm; color: #fbbf24; text-transform: uppercase; }
                        .role-badge { font-size: 2mm; font-weight: 900; background: rgba(251, 191, 36, 0.1); color: #fbbf24; padding: 1mm 2mm; border-radius: 1mm; border: 0.2mm solid rgba(251, 191, 36, 0.2); text-transform: uppercase; }
                        
                        .main-content { display: flex; gap: 4mm; align-items: center; }
                        .photo-frame { width: 18mm; height: 18mm; border-radius: 3mm; background: #1e293b; border: 0.5mm solid #fbbf24; overflow: hidden; flex-shrink: 0; display: flex; items-center; justify-content: center; }
                        .photo-img { width: 100%; height: 100%; object-fit: cover; }
                        .name-area { flex-grow: 1; }
                        .full-name { font-size: 4.5mm; font-weight: 900; line-height: 1.1; margin-bottom: 1mm; font-family: 'Outfit', sans-serif; }
                        .staff-id { font-size: 2.2mm; font-weight: 700; color: #94a3b8; letter-spacing: 0.3mm; }

                        .footer { display: flex; justify-content: space-between; align-items: end; border-top: 0.2mm solid rgba(148, 163, 184, 0.2); padding-top: 2mm; }
                        .qr-area { background: white; padding: 1mm; border-radius: 1.5mm; flex-shrink: 0; }
                        .security-shield { display: flex; align-items: center; gap: 1mm; color: #fbbf24; font-size: 1.8mm; font-weight: 900; text-transform: uppercase; }
                        
                        @media print { body { background: white; padding: 0; display: block; } .card-outer { box-shadow: none; -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    <div class="card-outer">
                        ${content}
                    </div>
                </body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <div className="glass-card bg-white sophisticated-shadow border-slate-200 p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-black text-xl text-slate-900 leading-none">Smart Identity Preview</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Executive Personnel Identification Card</p>
                </div>
                <button onClick={handlePrint} className="btn-primary flex items-center gap-2 group">
                    <Award size={18} className="group-hover:scale-110 transition-transform" />
                    Print Personnel Card
                </button>
            </div>

            <div id={`smart-card-${staff.id}`} className="hidden">
                <div className="card-inner">
                    <div className="mesh-bg"></div>
                    <div className="accent-line"></div>
                    <div className="header">
                        <div className="school-name">KUNTAU-PAY <span style={{color: 'white'}}>MATRIX</span></div>
                        <div className="role-badge">{staff.role}</div>
                    </div>

                    <div className="main-content">
                        <div className="photo-frame">
                            {staff.photoUrl ? (
                                <img src={staff.photoUrl} className="photo-img" alt="Staff" />
                            ) : (
                                <User size={40} color="#fbbf24" strokeWidth={1} />
                            )}
                        </div>
                        <div className="name-area">
                            <div className="full-name">{staff.firstName}<br />{staff.lastName}</div>
                            <div className="staff-id text-gold">STAFF ID: 00{staff.id} / SECURE</div>
                        </div>
                    </div>

                    <div className="footer">
                        <div className="security-shield">
                            <ShieldCheck size={10} /> Cryptographically Verifiable Card
                        </div>
                        <div className="qr-area">
                            <QRCodeSVG value={staff.id.toString()} size={45} level="H" />
                        </div>
                    </div>
                </div>
            </div>

            {/* In-app visible preview */}
            <div className="relative group cursor-pointer" onClick={handlePrint}>
                <div className="w-[350px] aspect-[1.58/1] bg-slate-900 rounded-[20px] p-6 text-white relative overflow-hidden transition-all group-hover:scale-[1.02] shadow-2xl border border-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-[12px] font-black text-primary tracking-widest uppercase flex items-center gap-2">
                             KUNTAU-PAY MATRIX
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[8px] font-black uppercase tracking-widest leading-none">
                            {staff.role}
                        </span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
                            {staff.photoUrl ? (
                                <img src={staff.photoUrl} className="w-full h-full object-cover" alt="Staff" />
                            ) : (
                                <User className="text-primary/50" size={32} />
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-black font-outfit uppercase tracking-tight leading-1.1">{staff.firstName} {staff.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: STAFF-0{staff.id}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-widest">
                            <ShieldCheck size={14} /> SECURE IDENTITY PROTOCOL
                        </div>
                        <div className="p-1.5 bg-white rounded-lg">
                            <QRCodeSVG value={staff.id.toString()} size={35} />
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px] flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xs font-black uppercase tracking-widest text-white shadow-2xl">
                        Click to Dispatch Print
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffSmartCard;
