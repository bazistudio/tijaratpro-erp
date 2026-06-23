'use client';

import React, { useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';
import { ProductSearch } from './ProductSearch';
import { CartTable } from './CartTable';
import { CartSummary } from './CartSummary';
import { InvoiceReceipt } from './invoice/InvoiceReceipt';

export const SaleWorkspace = () => {
  const { activeTabId, saleTabs, lastActionMessage, setLastActionMessage } = usePosStore();
  const activeSession = saleTabs.find(t => t.id === activeTabId);

  // Clear message after 3 seconds
  useEffect(() => {
    if (lastActionMessage) {
      const timer = setTimeout(() => {
        setLastActionMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastActionMessage, setLastActionMessage]);

  if (!activeSession) return null;

  return (
    <>
      <InvoiceReceipt />

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[65%] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
            <ProductSearch />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[35%] flex flex-col bg-gray-50 dark:bg-gray-800/50 overflow-hidden border-l border-gray-200 dark:border-gray-800 relative">
          
          {/* Status Message Banner */}
          {lastActionMessage && (
            <div className="absolute top-0 left-0 right-0 z-10 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-sm shadow-sm">
                {lastActionMessage}
              </div>
            </div>
          )}

          <div className={`p-4 flex-1 flex flex-col gap-4 overflow-hidden ${lastActionMessage ? 'pt-12' : 'transition-all duration-300'}`}>
            <CartTable />
            <CartSummary />
          </div>
        </div>

      </div>
    </>
  );
};

