'use client';

import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, RefreshCw, Eye } from 'lucide-react';
import { InventoryProduct, SortField, SortDirection, StockStatus } from '../../features/inventory/types';
import { StockStatusBadge } from './StockStatusBadge';
import { selectSortConfig, selectInventoryActions } from '../../features/inventory/store/inventory.selectors';

interface InventoryTableProps {
  products: InventoryProduct[];
  isLoading: boolean;
}

function SortIcon({ field, activeField, direction }: { field: SortField; activeField: SortField; direction: SortDirection }) {
  if (field !== activeField) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
  return direction === 'asc'
    ? <ArrowUp className="h-3.5 w-3.5 text-[#006970] dark:text-[#00B4BB]" />
    : <ArrowDown className="h-3.5 w-3.5 text-[#006970] dark:text-[#00B4BB]" />;
}

export const InventoryTable = ({ products, isLoading }: InventoryTableProps) => {
  const sort = selectSortConfig();
  const { setSort, updateStock } = selectInventoryActions();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleSort = (field: SortField) => {
    setSort({
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const startEdit = (product: InventoryProduct) => {
    setEditingId(product.id);
    setEditValue(String(product.stock));
  };

  const commitEdit = async (productId: string) => {
    const newStock = parseInt(editValue, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      await updateStock(productId, newStock);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') commitEdit(productId);
    if (e.key === 'Escape') setEditingId(null);
  };

  const rowBg = (product: InventoryProduct) => {
    if (product.status === StockStatus.OUT_OF_STOCK) return 'bg-red-50/50 dark:bg-red-900/5';
    if (product.status === StockStatus.LOW_STOCK) return 'bg-amber-50/50 dark:bg-amber-900/5';
    return '';
  };

  const columns: { label: string; field?: SortField }[] = [
    { label: 'Product', field: 'name' },
    { label: 'Category', field: 'category' },
    { label: 'SKU' },
    { label: 'Stock', field: 'stock' },
    { label: 'Status' },
    { label: 'Price', field: 'price' },
    { label: 'Actions' },
  ];

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No products found</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 flex items-start justify-center pt-8 pointer-events-none">
           <div className="h-6 w-6 rounded-full border-2 border-[#006970] border-t-transparent animate-spin"></div>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap ${col.field ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                onClick={() => col.field && handleSort(col.field)}
              >
                <span className="flex items-center gap-1.5">
                  {col.label}
                  {col.field && <SortIcon field={col.field} activeField={sort.field} direction={sort.direction} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {products.map((product) => (
            <tr
              key={product.id}
              className={`group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${rowBg(product)}`}
            >
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{product.name}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-500 dark:text-gray-400">{product.category}</span>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                  {product.sku}
                </code>
              </td>
              <td className="px-4 py-3">
                {editingId === product.id ? (
                  <input
                    type="number"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitEdit(product.id)}
                    onKeyDown={(e) => handleKeyDown(e, product.id)}
                    autoFocus
                    className="w-16 rounded border border-[#006970] bg-white dark:bg-gray-800 px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006970]"
                  />
                ) : (
                  <span
                    className={`font-semibold cursor-pointer hover:text-[#006970] dark:hover:text-[#00B4BB] transition-colors ${
                      product.status === StockStatus.OUT_OF_STOCK ? 'text-red-600 dark:text-red-400' :
                      product.status === StockStatus.LOW_STOCK ? 'text-amber-600 dark:text-amber-400' :
                      'text-gray-900 dark:text-white'
                    }`}
                    onClick={() => startEdit(product)}
                    title="Click to edit stock"
                  >
                    {product.stock} {product.unit}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <StockStatusBadge status={product.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  ₨ {product.price.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(product)}
                    className="p-1.5 rounded-md hover:bg-[#006970]/10 text-gray-400 hover:text-[#006970] dark:hover:text-[#00B4BB] transition-colors"
                    title="Edit stock"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="View product"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    title="Restock"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
