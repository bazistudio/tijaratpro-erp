// src/features/inventory/hooks/useInventoryData.ts

import { useMemo } from 'react';
import { useInventoryStore } from '../store';
import { filterBySearch, computeInventoryStats } from '../utils';
import { InventoryProduct, InventoryFilterType, SortField, SortDirection } from '../types';

function applyStatusFilter(products: InventoryProduct[], filter: InventoryFilterType) {
  if (filter === 'low_stock') return products.filter((p) => p.status === 'LOW_STOCK');
  if (filter === 'out_of_stock') return products.filter((p) => p.status === 'OUT_OF_STOCK');
  return products;
}

function applySort(products: InventoryProduct[], field: SortField, direction: SortDirection) {
  return [...products].sort((a, b) => {
    let aVal: string | number = a[field];
    let bVal: string | number = b[field];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function useInventoryData() {
  const { products, searchTerm, activeFilter, sort, isLoading } = useInventoryStore();

  const filtered = useMemo(() => {
    let result = filterBySearch(products, searchTerm);
    result = applyStatusFilter(result, activeFilter);
    result = applySort(result, sort.field, sort.direction);
    return result;
  }, [products, searchTerm, activeFilter, sort]);

  const stats = useMemo(() => computeInventoryStats(products), [products]);

  return { filtered, stats, isLoading };
}
