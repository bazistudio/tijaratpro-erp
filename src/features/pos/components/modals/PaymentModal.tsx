'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, CreditCard, Banknote, Building2, Smartphone, UserCircle2, Plus, Trash2 } from 'lucide-react';
import { PaymentMethod } from '../../store/usePosStore';

interface Props {
  grandTotal: number;
  onClose: () => void;
  onConfirm: (paymentBreakdown: { method: string; amount: number }[]) => void;
  onCreditSelect: () => void;
}

export const PaymentModal: React.FC<Props> = ({ grandTotal, onClose, onConfirm, onCreditSelect }) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState<string>('');
  const [payments, setPayments] = useState<{ method: string; amount: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRefund = grandTotal < 0;
  const absTotal = Math.abs(grandTotal);

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingDue = Math.max(0, absTotal - totalPaid);
  
  const parsedCash = parseInt(cashInput || '0', 10);
  const change = (!isRefund && totalPaid + parsedCash > absTotal) ? (totalPaid + parsedCash) - absTotal : 0;

  useEffect(() => {
    if (method === 'cash' && !isRefund && remainingDue > 0) {
      inputRef.current?.focus();
    }
  }, [method, isRefund, remainingDue]);

  const handleAddPayment = () => {
    if (method === 'credit') {
      onCreditSelect();
      return;
    }
    if (isRefund) {
      onConfirm([{ method, amount: absTotal }]);
      return;
    }

    if (parsedCash > 0) {
      // If payment exceeds remaining, we clamp the amount actually paid to the remaining amount for the breakdown,
      // and calculate change returned later. Actually, the requirement says "sum of all payments must equal or be less than total".
      // Wait, if a customer gives 5000 for a 4000 due, the actual payment recorded is 4000, and change is 1000.
      const amountToRecord = Math.min(parsedCash, remainingDue);
      
      setPayments([...payments, { method, amount: amountToRecord }]);
      setCashInput('');
    }
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const handleConfirm = () => {
    // If credit is selected, go to ledger settlement
    if (method === 'credit' && payments.length === 0) {
      onCreditSelect();
      return;
    }
    
    // Partial payment allowed: remainingDue > 0 means it creates credit
    if (remainingDue > 0) {
      // User must be aware that the remaining becomes credit.
      // We will allow confirmation, and remainingDue will be tracked.
    }
    
    // If they haven't "added" the current cashInput but clicked confirm
    let finalPayments = [...payments];
    if (parsedCash > 0 && remainingDue > 0) {
      const amountToRecord = Math.min(parsedCash, remainingDue);
      finalPayments.push({ method, amount: amountToRecord });
    }

    onConfirm(finalPayments);
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-[#006970]/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Processing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[450px]">
          
          {/* Left Panel: Payment Methods & Current Input */}
          <div className="w-full md:w-1/2 p-4 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Select Method</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  disabled={remainingDue === 0 && !isRefund}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${method === opt.id ? 'border-[#006970] bg-[#006970]/10 text-[#006970]' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#006970]/30'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {opt.icon}
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Input based on method and type */}
            <div className="mt-auto">
              {method === 'credit' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 p-4 rounded-lg text-center text-sm font-semibold">
                  Credit selected. Any unpaid balance will be moved to the Ledger.
                </div>
              ) : isRefund ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-lg text-center text-sm font-semibold">
                  Refund transaction. Shop will payout Rs {absTotal.toLocaleString()}.
                </div>
              ) : remainingDue === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-4 rounded-lg text-center text-sm font-semibold">
                  Fully Paid!
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Amount to Add</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rs</span>
                      <input
                        ref={inputRef}
                        type="number"
                        value={cashInput}
                        onChange={(e) => setCashInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPayment()}
                        placeholder={remainingDue.toString()}
                        className="w-full pl-12 pr-4 py-3 text-xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#006970] focus:ring-0 no-spinners tabular-nums"
                      />
                    </div>
                    <button 
                      onClick={handleAddPayment}
                      disabled={parsedCash <= 0}
                      className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white px-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Amount Details & Breakdown */}
          <div className="w-full md:w-1/2 flex flex-col p-6 bg-white dark:bg-gray-900">
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 font-semibold">{isRefund ? 'Total Refund' : 'Total Invoice Amount'}</p>
                <p className="text-2xl font-black tabular-nums">
                  Rs {absTotal.toLocaleString()}
                </p>
              </div>

              {!isRefund && (
                <>
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <p className="font-semibold">Total Paid</p>
                    <p className="text-xl font-bold tabular-nums">
                      Rs {totalPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-orange-500 dark:text-orange-400">
                    <p className="font-semibold">Remaining Due</p>
                    <p className="text-xl font-bold tabular-nums">
                      Rs {remainingDue.toLocaleString()}
                    </p>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="font-semibold">Change to Return</p>
                      <p className="text-xl font-bold tabular-nums">
                        Rs {change.toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Split Payments List */}
            {!isRefund && payments.length > 0 && (
              <div className="flex-1 overflow-y-auto mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Breakdown</h4>
                <div className="space-y-2">
                  {payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 uppercase">
                          {p.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">
                          Rs {p.amount.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleRemovePayment(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleConfirm}
              disabled={!isRefund && payments.length === 0 && parsedCash === 0 && method !== 'credit'}
              className="mt-auto w-full py-4 bg-[#006970] hover:bg-[#005a60] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
            >
              {remainingDue > 0 && method === 'credit' ? 'Proceed to Ledger' : remainingDue > 0 ? 'Complete as Partial' : 'Complete Sale'}
              <CheckCircle2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
