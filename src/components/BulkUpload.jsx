import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const BulkUpload = ({ schoolId }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE}/bulk-upload/students`, {
                method: 'POST',
                headers: { 'x-school-id': schoolId },
                body: formData
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['firstName', 'lastName', 'admissionNumber', 'classId', 'isScholarship'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Bulk Data Ingestion</h1>
                <p className="text-slate-500 mt-2 font-medium">Import student records via CSV or Excel spreadsheets</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card p-10 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 hover:border-primary/30 transition-all group bg-white sophisticated-shadow">
                    <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <Upload size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Drop your spreadsheet here</h3>
                    <p className="text-slate-500 text-sm mt-2 text-center max-w-xs font-medium">Supports .csv, .xlsx, and .xls formats. Ensure headers match the template.</p>
                    
                    <input 
                        type="file" 
                        id="bulk-file" 
                        className="hidden" 
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".csv,.xlsx,.xls"
                    />
                    <label 
                        htmlFor="bulk-file"
                        className="mt-8 px-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 cursor-pointer transition-all text-slate-700"
                    >
                        {file ? file.name : 'Select File'}
                    </label>

                    {file && (
                        <button 
                            onClick={handleUpload}
                            disabled={loading}
                            className="btn-primary mt-6 w-full shadow-xl"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Process Import'}
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 bg-white sophisticated-shadow border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[3px]">Required Columns</h4>
                            <button 
                                onClick={handleDownloadTemplate}
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
                            >
                                <Download size={14} /> Download CSV Template
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['firstName', 'lastName', 'admissionNumber', 'classId', 'isScholarship'].map(col => (
                                <div key={col} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <FileText size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">{col}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {result && (
                        <div className="glass-card p-8 border-emerald-500/20 animate-in zoom-in-95 duration-300">
                             <div className="flex items-center gap-4 text-emerald-400 mb-6">
                                <CheckCircle2 size={24} />
                                <h4 className="font-black uppercase tracking-widest">Processing Complete</h4>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Successfully Added</p>
                                    <p className="text-2xl font-black text-emerald-400 mt-1">{result.created}</p>
                                </div>
                                <div className="p-4 bg-slate-800/20 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Skipped/Existing</p>
                                    <p className="text-2xl font-black text-slate-300 mt-1">{result.skipped}</p>
                                </div>
                             </div>
                             {result.errors.length > 0 && (
                                <div className="mt-6 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 max-h-40 overflow-y-auto">
                                    <p className="text-[10px] font-black text-rose-400 uppercase mb-2">Error Log</p>
                                    {result.errors.map((err, i) => (
                                        <p key={i} className="text-[10px] text-rose-300/70 mb-1">• {err.error}</p>
                                    ))}
                                </div>
                             )}
                        </div>
                    )}

                    {error && (
                        <div className="glass-card p-8 border-rose-500/20 flex items-center gap-4 text-rose-400">
                            <AlertCircle size={24} />
                            <div>
                                <p className="font-black uppercase tracking-widest text-xs">Import Failed</p>
                                <p className="text-sm opacity-80 mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
