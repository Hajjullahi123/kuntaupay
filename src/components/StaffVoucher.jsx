import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, User, Calendar, Building2, ShieldCheck, Mail, Phone, Banknote, History, CheckCircle2 } from 'lucide-react';

const StaffVoucher = ({ voucher }) => {
    if (!voucher) return null;

    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        win.document.write(`
            <html>
                <head>
                    <title>Staff Payment Voucher - ${voucher.staff.firstName} ${voucher.staff.lastName}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #020617; }
                        .voucher { border: 2px solid #f1f5f9; border-radius: 20px; padding: 40px; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
                        .title { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
                        .meta { text-align: right; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                        .section-title { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
                        .info-item { background: #f8fafc; padding: 15px; border-radius: 12px; }
                        .info-label { font-size: 10px; font-weight: 800; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
                        .info-value { font-size: 14px; font-weight: 800; color: #0f172a; }
                        .table { w-full; margin-bottom: 40px; }
                        .tr { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f5f9; }
                        .td-label { font-size: 12px; font-weight: 600; }
                        .td-value { font-size: 12px; font-weight: 800; }
                        .deduction { color: #e11d48; }
                        .addition { color: #059669; }
                        .summary { background: #0f172a; color: white; padding: 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
                        .net-label { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
                        .net-value { font-size: 32px; font-weight: 900; }
                        .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <div className="glass-card bg-white sophisticated-shadow border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xl text-slate-900">Voucher Preview</h3>
                <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                    <Printer size={16} /> Execute Print Protocol
                </button>
            </div>

            <div ref={printRef} className="voucher">
                <div className="header">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="title">Kuntau-Pay <span className="text-primary">Matrix</span></div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Payroll Architecture</div>
                        </div>
                    </div>
                    <div className="meta">
                        <div>Voucher ID: #PAY-00{voucher.id}</div>
                        <div>Date: {new Date().toLocaleDateString()}</div>
                        <div className="text-emerald-600">Status: {voucher.status}</div>
                        <div style={{ marginTop: '10px', fontWeight: 900, letterSpacing: '2px', color: '#e11d48', fontSize: '14px'}}>SECURE ID: {voucher.fingerprint || 'PENDING'}</div>
                    </div>
                </div>

                <div className="section-title">Personnel Identity Matrix</div>
                <div className="info-grid">
                    <div className="info-item">
                        <div className="info-label">Staff Name</div>
                        <div className="info-value">{voucher.staff.firstName} {voucher.staff.lastName}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Corporate Role</div>
                        <div className="info-value">{voucher.staff.role}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Fiscal Month/Year</div>
                        <div className="info-value">{voucher.month}/{voucher.year}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Bank Settlement Info</div>
                        <div className="info-value">{voucher.staff.bankDetails || 'N/A'}</div>
                    </div>
                </div>

                <div className="section-title">Disbursement Breakdown</div>
                <div className="table">
                    {voucher.items.map(item => (
                        <div key={item.id} className="tr">
                            <div>
                                <div className="td-label">{item.name}</div>
                                {item.explanation && <div className="text-[10px] text-slate-400 font-medium">{item.explanation}</div>}
                            </div>
                            <div className={`td-value ${item.type === 'DEDUCTION' ? 'deduction' : 'addition'}`}>
                                {item.type === 'DEDUCTION' ? '-' : '+'} ₦{item.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="summary">
                    <div className="net-label text-slate-300">Net Payable Amount</div>
                    <div className="net-value">₦{voucher.netAmount.toLocaleString()}</div>
                </div>

                <div className="footer">
                    ELECTRONICALLY GENERATED BY KUNTAU-PAY MATRIX SYSTEM • SECURE PROTOCOL • CRYPTOGRAPHICALLY VERIFIABLE
                </div>
            </div>
        </div>
    );
};

export default StaffVoucher;
