// src/features/inventory/constants/inventory.constants.ts

export const DEFAULT_PAGE_SIZE = 50;
export const RETRY_COUNT = 3;
export const LOW_STOCK_DEFAULT = 5;

export const INVENTORY_ENDPOINTS = {
  GET_PRODUCTS: '/api/products/my-products',
  ADJUST_STOCK: '/api/inventory/adjust',
  CREATE_PRODUCT: '/api/products/add',
  GET_CATEGORIES: '/api/categories/my-categories',
};
