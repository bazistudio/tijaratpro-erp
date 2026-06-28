'use client';

import React from 'react';
import { usePosStore } from '../store/usePosStore';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const SaleTabNavigation = () => {
  const { saleTabs, activeTabId, switchSaleTab, closeSaleTab } = usePosStore();

  const inactiveColors = [
    'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40',
    'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40',
    'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40'
  ];

  const activeColor = 'bg-emerald-500 text-white shadow-md font-bold dark:bg-emerald-600';

  return (
    <div className="flex items-center justify-center gap-2 shrink-0 h-9 w-full max-w-[300px]">
      {saleTabs.map((tab, index) => {
        const isActive = activeTabId === tab.id;
        const colorClass = isActive ? activeColor : inactiveColors[index % inactiveColors.length];
        
        return (
          <div
            key={tab.id}
            onClick={() => switchSaleTab(tab.id)}
            className={clsx(
              'relative flex justify-center items-center h-full flex-1 rounded-md cursor-pointer transition-all duration-200 select-none',
              colorClass
            )}
          >
            <span className="truncate px-2 text-center text-xs tracking-wide">{tab.name}</span>
          </div>
        );
      })}
    </div>
  );
};
