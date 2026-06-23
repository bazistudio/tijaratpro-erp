'use client';

import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/usePosStore';
import { Plus } from 'lucide-react';

export const PosHeader = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { saleTabs, createSaleTab } = usePosStore();

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 z-10">
      <div className="flex items-center gap-4">

        <div>
          <h1 className="text-lg font-bold text-[#006970] dark:text-[#008990]">TijaratPro POS</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Cashier: Admin • <span className="font-semibold text-[#006970] dark:text-[#00B4BB]">Sales Active: {saleTabs.length}/3</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
          </p>
        </div>

        <button
          onClick={createSaleTab}
          disabled={saleTabs.length >= 3}
          className="flex items-center gap-2 rounded-lg bg-[#006970] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005a60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#006970] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Sale</span>
        </button>
      </div>
    </header>
  );
};
