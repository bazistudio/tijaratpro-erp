// src/features/inventory/services/inventory.service.ts

import { inventoryRepository } from '../repositories/inventory.repository';
import { inventoryMapper } from '../mappers/inventory.mapper';
import { retry } from '@/shared/lib/retry';
import { RETRY_COUNT, LOW_STOCK_DEFAULT } from '../constants/inventory.constants';
import { InventoryProduct, PaginationParams, InventoryAdjustmentType, StockStatus } from '../types';

/**
 * Service Layer
 * Enforces business rules and orchestrates data flow between Repository and Mappers.
 */
export const inventoryService = {
  
  /**
   * Business Intelligence: Determine StockStatus dynamically based on thresholds.
   */
  calculateStockStatus: (stock: number, minThreshold: number = LOW_STOCK_DEFAULT): StockStatus => {
    if (stock <= 0) return StockStatus.OUT_OF_STOCK;
    if (stock <= minThreshold) return StockStatus.LOW_STOCK;
    return StockStatus.HEALTHY;
  },

  getProducts: async (params: PaginationParams): Promise<{ products: InventoryProduct[], total: number }> => {
    // Execute repository call with resilient exponential backoff
    const data = await retry(() => inventoryRepository.getProducts(params), RETRY_COUNT);
    
    // Process mapping with business rules applied
    const mappedProducts = data.products.map(dto => {
      const status = inventoryService.calculateStockStatus(dto.quantity, dto.lowStockThreshold);
      return inventoryMapper.dtoToProduct(dto, status);
    });

    return {
      products: mappedProducts,
      total: data.pagination.total,
    };
  },

  adjustStock: async (productId: string, quantity: number, type: InventoryAdjustmentType, reason?: string): Promise<number> => {
    if (quantity < 0) throw new Error('Quantity cannot be negative');
    
    const response = await retry(() => inventoryRepository.adjustStock(productId, quantity, type, reason), RETRY_COUNT);
    
    if (!response.success || response.newStock === undefined) {
      throw new Error(response.message || 'Failed to adjust stock');
    }
    
    return response.newStock;
  }
};
