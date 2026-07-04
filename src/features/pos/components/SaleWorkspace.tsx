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

      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* MAIN PANEL (Cart) */}
        <div className="flex-1 w-full flex flex-col bg-gray-50 dark:bg-gray-800/50 overflow-hidden h-full min-h-0">
          
          <div className="p-2 flex-1 grid grid-cols-12 gap-2 overflow-hidden min-h-0">
            
            {/* Left Column: Extra Actions (Products) */}
            <div className="col-span-3 md:col-span-2 lg:col-span-3 flex flex-col overflow-hidden h-full min-h-0">
              <PosExtraActions />
            </div>

            {/* Center Column: Cart Items */}
            <div className="col-span-6 md:col-span-6 lg:col-span-6 flex flex-col overflow-hidden h-full min-h-0">
              <CartTable />
            </div>
            
            {/* Right Column: Cart Summary */}
            <div className="col-span-3 md:col-span-4 lg:col-span-3 flex flex-col overflow-hidden h-full min-h-0">
              <CartSummary />
            </div>

          </div>
          
          {/* Global POS Action Buttons Bottom Bar Portal Target */}
          <div id="pos-action-bar-portal" className="w-full shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 relative"></div>
        </div>

      </div>
    </>
  );
};

