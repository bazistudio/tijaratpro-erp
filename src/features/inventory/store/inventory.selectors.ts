// src/features/inventory/store/inventory.selectors.ts

import { useInventoryStore } from './inventory.store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Granular selectors to prevent unnecessary component re-renders.
 */
export const selectProducts = () => useInventoryStore(state => state.products);
export const selectInventoryStatus = () => useInventoryStore(state => state.status);
export const selectInventoryError = () => useInventoryStore(state => state.error);
export const selectSearchTerm = () => useInventoryStore(state => state.searchTerm);
export const selectActiveFilter = () => useInventoryStore(state => state.activeFilter);
export const selectSortConfig = () => useInventoryStore(state => state.sort);

export const selectInventoryActions = () => useInventoryStore(useShallow(state => ({
  setSearch: state.setSearch,
  setFilter: state.setFilter,
  setSort: state.setSort,
  fetchProducts: state.fetchProducts,
  updateStock: state.updateStock
})));
