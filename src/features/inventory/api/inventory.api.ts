// src/features/inventory/api/inventory.api.ts

import axiosInstance from '@/lib/api/axios';
import { INVENTORY_ENDPOINTS } from '../constants/inventory.constants';
import { PaginatedProductsDTO, AdjustStockResponseDTO, ProductCategoryDTO } from '../dto/inventory.dto';
import { InventoryAdjustmentType, PaginationParams } from '../types';
import { ProductDTO } from '../dto/inventory.dto';

export const inventoryApi = {
  getProducts: async (params: PaginationParams) => {
    console.log("[DEBUG] API CALLED", params);
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
  },

  getCategories: async () => {
    const response = await axiosInstance.get<{ success: boolean; data?: ProductCategoryDTO[], categories?: ProductCategoryDTO[] }>(
      INVENTORY_ENDPOINTS.GET_CATEGORIES
    );
    // Handle different possible backend envelope structures
    return response.data.categories || response.data.data || [];
  },

  createProduct: async (formData: FormData) => {
    const response = await axiosInstance.post<{ message: string; product: ProductDTO }>(
      INVENTORY_ENDPOINTS.CREATE_PRODUCT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};
