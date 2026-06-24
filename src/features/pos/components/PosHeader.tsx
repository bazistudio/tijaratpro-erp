'use client';

import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/usePosStore';
import { Plus } from 'lucide-react';
import { ProductSearch } from './ProductSearch';
import { InvoiceSearch } from './InvoiceSearch';
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
    <header className="grid grid-cols-4 items-center gap-4 h-12 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 z-50">
      
      <div className="flex items-center w-full relative z-50">
        <div className="w-full max-w-sm">
          <ProductSearch />
        </div>
      </div>

      <div className="flex justify-center items-center h-full">
        <SaleTabNavigation />
      </div>
      
      <div className="flex justify-center items-center relative z-50 w-full">
        <div className="w-full max-w-[200px] xl:max-w-[250px]">
          <InvoiceSearch />
        </div>
      </div>

      <div className="flex flex-col items-end justify-center w-full">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-tight">
          {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
          {currentTime ? currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '...'}
        </p>
      </div>
      
    </header>
  );
};
