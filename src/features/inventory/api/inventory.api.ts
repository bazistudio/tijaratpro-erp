// src/features/inventory/api/inventory.api.ts

import axiosInstance from '@/lib/api/axios';
import { INVENTORY_ENDPOINTS } from '../constants/inventory.constants';
import { PaginatedProductsDTO, AdjustStockResponseDTO } from '../dto/inventory.dto';
import { InventoryAdjustmentType, PaginationParams } from '../types';

export const inventoryApi = {
  getProducts: async (params: PaginationParams) => {
    const { page, limit, category } = params;
    
    // Using URLSearchParams cleanly formats the query string
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (category && category !== 'all') {
      searchParams.append('category', category);
    }

    const response = await axiosInstance.get<PaginatedProductsDTO>(
      `${INVENTORY_ENDPOINTS.GET_PRODUCTS}?${searchParams.toString()}`
    );
    return response.data;
  },

  adjustStock: async (
    productId: string, 
    quantity: number, 
    type: InventoryAdjustmentType, 
    reason?: string
  ) => {
    const response = await axiosInstance.post<AdjustStockResponseDTO>(
      INVENTORY_ENDPOINTS.ADJUST_STOCK,
      {
        productId,
        type,
        quantity,
        reason,
        notes: reason
      }
    );
    return response.data;
  }
};
