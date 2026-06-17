'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, CreditCard, Banknote, Building2, Smartphone, UserCircle2 } from 'lucide-react';
import { PaymentMethod } from '../../store/usePosStore';

interface Props {
  grandTotal: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, cashReceived: number) => void;
  onCreditSelect: () => void;
}

export const PaymentModal: React.FC<Props> = ({ grandTotal, onClose, onConfirm, onCreditSelect }) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // If grandTotal is negative, it's a refund. 
  // We don't ask for cash received from customer, we just refund them.
  const isRefund = grandTotal < 0;
  const absTotal = Math.abs(grandTotal);

  const parsedCash = parseInt(cashInput || '0', 10);
  
  // Calculate change ONLY if it's a positive sale and cash is received
  const change = (!isRefund && parsedCash > grandTotal) ? parsedCash - grandTotal : 0;
  
  // Validation: if it's a sale, cash must cover total. If refund, valid automatically.
  const isValid = isRefund || parsedCash >= grandTotal;

  useEffect(() => {
    if (method === 'cash' && !isRefund) {
      inputRef.current?.focus();
    }
  }, [method, isRefund]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && isValid) handleConfirm();
  };

  const handleConfirm = () => {
    if (method === 'credit') {
      onCreditSelect();
      return;
    }
    if (isValid) {
      // In refund, cashReceived is technically 0 from customer.
      onConfirm(method, isRefund ? 0 : parsedCash);
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'cash', label: 'Cash', icon: <Banknote className="h-5 w-5" /> },
    { id: 'card', label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'bank', label: 'Bank', icon: <Building2 className="h-5 w-5" /> },
    { id: 'easypaisa', label: 'EasyPaisa', icon: <Smartphone className="h-5 w-5" /> },
    { id: 'jazzcash', label: 'JazzCash', icon: <Smartphone className="h-5 w-5" /> },
    { id: 'credit', label: 'Credit (Ledger)', icon: <UserCircle2 className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-[#006970]/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Processing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[400px]">
          
          {/* Left Panel: Payment Methods */}
          <div className="w-full md:w-1/2 p-4 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Select Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${method === opt.id ? 'border-[#006970] bg-[#006970]/10 text-[#006970]' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#006970]/30'}`}
                >
                  {opt.icon}
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Amount Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-6 bg-white dark:bg-gray-900">
            
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">{isRefund ? 'Refund to Customer' : 'Total Due'}</p>
                <p className={`text-4xl font-black tabular-nums tracking-tight mt-1 ${isRefund ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  Rs {absTotal.toLocaleString()}
                </p>
              </div>

              {/* Dynamic Input based on method and type */}
              {method === 'credit' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 p-4 rounded-lg text-center text-sm font-semibold">
                  Credit selected. This will skip cash validation and open the Ledger Settlement immediately.
                </div>
              ) : isRefund ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-lg text-center text-sm font-semibold">
                  Refund transaction. Shop will payout Rs {absTotal.toLocaleString()}.
                </div>
              ) : method === 'cash' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cash Received</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rs</span>
                    <input
                      ref={inputRef}
                      type="number"
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#006970] focus:ring-0 no-spinners tabular-nums transition-colors"
                    />
                  </div>
                  {parsedCash > 0 && (
                    <div className="flex justify-between items-center mt-4 px-2">
                      <span className="text-sm font-semibold text-gray-500">Change Due</span>
                      <span className={`text-xl font-bold tabular-nums ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        Rs {change.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {method.toUpperCase()} processing selected.
                  <p className="mt-1 text-xs font-normal">Ensure terminal/app transfer is confirmed before proceeding.</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleConfirm}
              disabled={method !== 'credit' && !isValid}
              className="mt-8 w-full py-4 bg-[#006970] hover:bg-[#005a60] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
            >
              {method === 'credit' ? 'Proceed to Ledger' : 'Complete Sale'}
              <CheckCircle2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
