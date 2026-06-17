'use client';

import React from 'react';
import { usePosStore } from '../store/usePosStore';
import { ProductSearch } from './ProductSearch';
import { CartTable } from './CartTable';
import { CartSummary } from './CartSummary';
import { InvoiceReceipt } from './invoice/InvoiceReceipt';

export const SaleWorkspace = () => {
  const { activeTabId, saleTabs } = usePosStore();
  const activeSession = saleTabs.find(t => t.id === activeTabId);

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
        <div className="w-[35%] flex flex-col bg-gray-50 dark:bg-gray-800/50 overflow-hidden border-l border-gray-200 dark:border-gray-800">
          <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">

            {/* Customer */}
            <div className="h-16 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center px-4 bg-white dark:bg-gray-900 shrink-0 shadow-sm">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Customer
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {activeSession.customer?.name || 'Walk-In Customer'}
                </p>
              </div>

              <button className="text-xs text-[#006970] font-semibold hover:underline">
                Change
              </button>
            </div>

            <CartTable />
            <CartSummary />

          </div>
        </div>

      </div>
    </>
  );
};
