import { Printer, X } from 'lucide-react'

const SecureReceipt = ({ isOpen, onClose, payment, student, school }) => {
    if (!isOpen || !payment) return null;

    const receiptRef = payment.reference || `REC-${payment.id}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-50/90 backdrop-blur-md z-[200] flex items-start justify-center p-8 overflow-auto print:bg-white print:p-0 no-print-bg">
            <div className="bg-white text-black w-full max-w-2xl min-h-[60vh] p-16 shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:p-8">
                <div className="absolute top-4 right-4 flex gap-4 no-print">
                    <button onClick={handlePrint} className="p-2 border border-slate-300 rounded hover:bg-slate-50">
                        <Printer size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 border border-slate-300 rounded hover:bg-slate-50 text-rose-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="text-center mb-10 flex flex-col items-center">
                    <img src="/images/school_logo_transparent.png" alt="School Logo" className="w-24 h-24 object-contain mb-4" />
                    <h2 className="text-2xl font-bold font-sans">{school?.name || 'Amana Academy Model School'}</h2>
                    <h3 className="text-lg font-bold font-sans mt-1">Payment Receipt</h3>
                    <p className="text-sm font-semibold mt-2">Receipt No: {receiptRef}</p>
                </div>

                <div className="font-sans text-sm space-y-3 max-w-sm mx-auto">
                    <div className="flex justify-between">
                        <span className="font-bold">Student:</span>
                        <span>{student.firstName} {student.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Class:</span>
                        <span>{student.classModel?.name || ''} {student.classModel?.arm || ''}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Fee:</span>
                        <span>{payment.notes || 'School Fee'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Amount Paid:</span>
                        <span>₦{payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Payment Method:</span>
                        <span>{payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Date:</span>
                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-center mt-20 text-xs italic">
                    <p>Thank you for your payment</p>
                </div>
            </div>
        </div>
    );
};

export default SecureReceipt;
