'use client';

import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/usePosStore';
import { Plus } from 'lucide-react';
import { ProductSearch } from './ProductSearch';
import { SaleTabNavigation } from './SaleTabNavigation';

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
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 z-50">
      <div className="flex-1 flex items-center relative z-50">
        <div className="w-full max-w-sm">
          <ProductSearch />
        </div>
      </div>

      <div className="flex-1 flex justify-center h-full pt-2 shrink-0">
        <SaleTabNavigation />
      </div>

      <div className="flex-1 flex items-center justify-end pb-2 pr-2 shrink-0">
        <div className="flex flex-col items-end justify-center">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-tight">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
            {currentTime ? currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '...'}
          </p>
        </div>
      </div>
    </header>
  );
};
