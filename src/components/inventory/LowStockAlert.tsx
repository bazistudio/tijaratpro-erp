import React from 'react';
import { AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { InventoryProduct } from '../../features/inventory/types';

interface LowStockAlertProps {
  products: InventoryProduct[];
}

export const LowStockAlert = ({ products }: LowStockAlertProps) => {
  const outOfStock = products.filter((p) => p.status === 'OUT_OF_STOCK');
  const lowStock = products.filter((p) => p.status === 'LOW_STOCK');

  if (outOfStock.length === 0 && lowStock.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {outOfStock.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 truncate">{p.name}</p>
              <p className="text-xs text-red-500 dark:text-red-500">{p.sku} · Out of stock</p>
            </div>
          </div>
          <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline flex-shrink-0 flex items-center gap-0.5">
            Restock <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ))}

      {lowStock.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 truncate">{p.name}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">{p.sku} · Only {p.stock} left</p>
            </div>
          </div>
          <button className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex-shrink-0 flex items-center gap-0.5">
            Restock <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default LowStockAlert;
