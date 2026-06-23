import React from 'react';
import { LedgerTab } from '../types/ledger.types';

interface Props {
  activeTab: LedgerTab;
  onTabChange: (tab: LedgerTab) => void;
}

export const LedgerTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: { id: LedgerTab; label: string }[] = [
    { id: 'all', label: 'All Transactions' },
    { id: 'receivables', label: 'Receivables' },
    { id: 'payables', label: 'Payables' },
    { id: 'cash', label: 'Cash Book' },
    { id: 'bank', label: 'Bank Book' },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
      <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive 
                  ? 'border-[#006970] text-[#006970] dark:text-[#00B4BB] dark:border-[#00B4BB]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
