import React, { useState } from 'react';
import { useExpensesStore } from '../store/expenses.store';
import { X } from 'lucide-react';
import { ExpenseCategory } from '../types/expenses.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseCreateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addExpense, isAdding } = useExpensesStore();
  const [formData, setFormData] = useState({
    title: '',
    category: 'other' as ExpenseCategory,
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'bank' | 'online',
    status: 'paid' as 'paid' | 'pending',
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    await addExpense({
      date: new Date().toISOString(),
      title: formData.title,
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      note: formData.note
      // idempotencyKey is handled safely by the backend or we can generate it here
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Record Expense</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Expense Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white"
              placeholder="e.g. Electricity Bill"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Amount (Rs)</label>
              <input 
                required
                type="number" 
                min="0"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none capitalize text-neutral-900 dark:text-white"
              >
                <option value="rent">Rent</option>
                <option value="salary">Salary</option>
                <option value="utilities">Utilities</option>
                <option value="transport">Transport</option>
                <option value="purchase">Purchase</option>
                <option value="repair">Repair</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Payment Method</label>
              <select 
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Note (Optional)</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-neutral-900 dark:text-white"
              rows={2}
            />
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isAdding}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};
