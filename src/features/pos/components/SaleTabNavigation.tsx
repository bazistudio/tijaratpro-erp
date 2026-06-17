'use client';

import React from 'react';
import { usePosStore } from '../store/usePosStore';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const SaleTabNavigation = () => {
  const { saleTabs, activeTabId, switchSaleTab, closeSaleTab } = usePosStore();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
      {saleTabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => switchSaleTab(tab.id)}
            className={clsx(
              'group relative flex items-center min-w-[140px] max-w-[200px] h-10 px-4 rounded-t-lg cursor-pointer transition-all select-none',
              isActive
                ? 'bg-white dark:bg-gray-900 text-[#006970] dark:text-[#00B4BB] font-semibold border-t-2 border-[#006970] dark:border-[#00B4BB] shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            )}
          >
            <span className="truncate flex-1 text-sm">{tab.name}</span>
            {saleTabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: In future, check if cart has items and prompt confirmation
                  closeSaleTab(tab.id);
                }}
                className={clsx(
                  'ml-2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#006970]',
                  isActive 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500' 
                    : 'hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-300'
                )}
                title="Close tab"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
