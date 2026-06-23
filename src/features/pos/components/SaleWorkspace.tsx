'use client';

import React, { useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';
import { CartTable } from './CartTable';
import { CartSummary } from './CartSummary';
import { PosExtraActions } from './PosExtraActions';
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

        {/* MAIN PANEL (Cart) */}
        <div className="flex-1 w-full flex flex-col bg-gray-50 dark:bg-gray-800/50 overflow-hidden relative h-full">
          
          {/* Status Message Banner */}
          {lastActionMessage && (
            <div className="absolute top-0 left-0 right-0 z-10 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-sm shadow-sm">
                {lastActionMessage}
              </div>
            </div>
          )}

          <div className={`px-2 pt-2 pb-[106px] flex-1 flex flex-col lg:flex-row gap-2 overflow-hidden ${lastActionMessage ? 'pt-12' : 'transition-all duration-300'}`}>
            
            {/* Left Column: Extra Actions (25%) */}
            <div className="w-full lg:w-[25%] shrink-0 flex flex-col overflow-hidden h-full">
              <PosExtraActions />
            </div>

            {/* Center Column: Cart Items (45%) */}
            <div className="w-full lg:w-[45%] flex-1 min-w-0 flex flex-col overflow-hidden h-full">
              <CartTable />
            </div>
            
            {/* Right Column: Cart Summary (30%) */}
            <div className="w-full lg:w-[30%] shrink-0 flex flex-col overflow-hidden h-full">
              <CartSummary />
            </div>

          </div>
          
          {/* Global POS Action Buttons Bottom Bar Portal Target */}
          <div id="pos-action-bar-portal" className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 bg-white dark:bg-gray-900"></div>
        </div>

      </div>
    </>
  );
};

