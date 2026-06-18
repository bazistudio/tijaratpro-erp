import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { DBCustomer } from '@/lib/db';
import { FinancialService } from '@/features/pos/services/financial.service';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: DBCustomer | null;
}

export const ReceivePaymentModal = ({ isOpen, onClose, customer }: ReceivePaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !customer) return null;

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsSaving(true);
    try {
      await FinancialService.receiveCustomerPayment(
        customer.id, 
        Number(amount),
        method
      );
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Failed to save payment', err);
      alert('Failed to save payment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Receive Payment</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
              <p className="font-bold text-red-600 dark:text-red-400">Rs {customer.currentBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount Received
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rs</span>
              </div>
              <input
                type="number"
                className="block w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006970] focus:border-transparent text-lg font-semibold transition-colors"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Cash', icon: Banknote },
                { name: 'Bank Transfer', icon: CreditCard },
                { name: 'Easypaisa', icon: Smartphone },
                { name: 'JazzCash', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setMethod(m.name)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-[#006970] bg-[#006970]/5 text-[#006970] dark:border-[#00B4BB] dark:bg-[#00B4BB]/10 dark:text-[#00B4BB]'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!amount || isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-[#006970] hover:bg-[#00585e] rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>

      </div>
    </div>
  );
};
