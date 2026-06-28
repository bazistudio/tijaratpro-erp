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

  const timeString = currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
  const secondsString = currentTime ? currentTime.getSeconds().toString().padStart(2, '0') : '--';
  const dateString = currentTime ? currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';

  return (
    <header className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 h-auto md:h-16 py-2 md:py-0 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 z-50">
      
      {/* Section 1: Product Search */}
      <div className="flex items-center w-full relative z-50">
        <ProductSearch />
      </div>

      {/* Section 2: Sale Tabs */}
      <div className="flex justify-center items-center h-full w-full">
        <SaleTabNavigation />
      </div>
      
      {/* Section 3: Invoice Search */}
      <div className="flex justify-center items-center relative z-50 w-full">
        <InvoiceSearch />
      </div>

      {/* Section 4: Date & Time */}
      <div className="flex items-center justify-end gap-2 w-full">
        <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 h-8 rounded-md shadow-sm border border-emerald-100 dark:border-emerald-800/30">
          <span className="text-sm font-bold tabular-nums">{timeString}</span>
        </div>
        <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 h-8 rounded-md shadow-sm border border-red-100 dark:border-red-800/30">
          <span className="text-xs font-bold tabular-nums">{secondsString}</span>
        </div>
        <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 h-8 rounded-md shadow-sm border border-emerald-100 dark:border-emerald-800/30">
          <span className="text-xs font-semibold">{dateString}</span>
        </div>
      </div>
      
    </header>
  );
};
