import React from 'react';
import { StockStatus } from '../../features/inventory/types';

interface StockStatusBadgeProps {
  status: StockStatus;
  stock?: number;
}

const config: Record<StockStatus, { label: string; className: string; dot: string }> = {
  HEALTHY: {
    label: 'In Stock',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

export const StockStatusBadge = ({ status, stock }: StockStatusBadgeProps) => {
  const { label, className, dot } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse`} />
      {label}
      {stock !== undefined && (
        <span className="ml-0.5 font-bold">({stock})</span>
      )}
    </span>
  );
};

export default StockStatusBadge;
