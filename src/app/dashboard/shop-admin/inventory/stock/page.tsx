'use client';

import React from 'react';
import { useInventoryFilters, StockViewType } from '@/components/inventory/InventoryFilterContext';
import { InventoryTable, TableColumn } from '@/components/inventory/InventoryTable';

// Dummy data for testing
interface DummyStock {
  id: string;
  name: string;
  qty: number;
  status: string;
}

const dummyStockData: DummyStock[] = [
  { id: '1', name: 'LCD A52', qty: 10, status: 'In Stock' },
  { id: '2', name: 'Battery', qty: 2, status: 'Low Stock' },
];

export default function InventoryStockPage() {
  const { filters, updateFilter } = useInventoryFilters();

  const stockViews: { id: StockViewType; label: string }[] = [
    { id: 'update', label: 'Update Stock' },
    { id: 'restock', label: 'Restock' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'damaged', label: 'Damaged' },
    { id: 'replacement', label: 'Replacement' },
  ];

  const columns: TableColumn<DummyStock>[] = [
    { key: 'name', label: 'Product Name' },
    { key: 'qty', label: 'Qty' },
    { key: 'status', label: 'Status' },
    { 
      key: 'actions', 
      label: 'Action', 
      render: () => (
        <button className="text-[#006970] dark:text-[#00B4BB] hover:underline font-medium">
          Manage
        </button>
      )
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      
      {/* Stock Sub-Navigation */}
      <div className="flex px-4 pt-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-x-auto hide-scrollbar">
        {stockViews.map(view => (
          <button
            key={view.id}
            onClick={() => updateFilter('activeStockView', view.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filters.activeStockView === view.id
                ? 'border-[#006970] text-[#006970] dark:border-[#00B4BB] dark:text-[#00B4BB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Action Bar (Changes based on activeStockView) */}
      <div className="flex justify-end items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800">
        <button className="px-3 py-1.5 bg-[#006970] hover:bg-[#005a60] text-white text-sm font-medium rounded shadow-sm transition-colors">
          + Action
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden relative p-4">
        <InventoryTable columns={columns} data={dummyStockData} />
      </div>

    </div>
  );
}
