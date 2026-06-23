'use client';

import React from 'react';
import { usePosStore } from '../store/usePosStore';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const SaleTabNavigation = () => {
  const { saleTabs, activeTabId, switchSaleTab, closeSaleTab } = usePosStore();

  return (
    <div className="flex items-end gap-1 overflow-x-auto no-scrollbar shrink-0 h-full">
      {saleTabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => switchSaleTab(tab.id)}
            className={clsx(
              'group relative flex items-center min-w-[100px] max-w-[140px] h-8 px-3 rounded-t-lg cursor-pointer transition-all select-none',
              isActive
                ? 'bg-gray-100 dark:bg-gray-800 text-[#006970] dark:text-[#00B4BB] font-semibold border-t-2 border-[#006970] dark:border-[#00B4BB]'
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-t-2 border-transparent'
            )}
          >
            <span className="truncate flex-1 text-xs">{tab.name}</span>
          </div>
        );
      })}
    </div>
  );
};
