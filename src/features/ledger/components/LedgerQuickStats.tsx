import React from 'react';
import { LedgerQuickStats as Stats } from '../types/ledger.types';

interface Props {
  stats: Stats;
}

export const LedgerQuickStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-[#006970]/5 dark:bg-[#006970]/10 rounded-lg p-3 flex flex-wrap gap-x-8 gap-y-2 mb-6 border border-[#006970]/20 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Today's Sales:</span>
        <span className="font-bold text-[#006970] dark:text-[#00B4BB]">Rs {stats.todaySales.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Today's Expenses:</span>
        <span className="font-bold text-red-600 dark:text-red-400">Rs {stats.todayExpenses.toLocaleString()}</span>
      </div>
      <div className="hidden md:block w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2"></div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Pending Receivable:</span>
        <span className="font-bold text-gray-800 dark:text-gray-200">Rs {stats.pendingReceivable.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Pending Payable:</span>
        <span className="font-bold text-gray-800 dark:text-gray-200">Rs {stats.pendingPayable.toLocaleString()}</span>
      </div>
    </div>
  );
};
