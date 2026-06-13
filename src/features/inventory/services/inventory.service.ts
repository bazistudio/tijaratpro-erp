// src/features/inventory/services/inventory.service.ts

import { inventoryRepository } from '../repositories/inventory.repository';
import { inventoryMapper } from '../mappers/inventory.mapper';
import { retry } from '@/shared/lib/retry';
import { RETRY_COUNT, LOW_STOCK_DEFAULT } from '../constants/inventory.constants';
import { InventoryProduct, PaginationParams, InventoryAdjustmentType, StockStatus, ProductCategory } from '../types';
import { CreateProductDTO } from '../dto/inventory.dto';

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
    console.log("[DEBUG] SERVICE CALLED");
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
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    const dtos = await retry(() => inventoryRepository.getCategories(), RETRY_COUNT);
    return dtos.map(dto => ({
      id: dto._id,
      name: dto.name
    }));
  },

  createProduct: async (productData: CreateProductDTO, imageFile?: File): Promise<InventoryProduct> => {
    const formData = new FormData();
    
    // Auto-generate SKU if empty to prepare for Phase 4.2 PDF matching
    const skuToUse = productData.sku && productData.sku.trim() !== '' 
      ? productData.sku 
      : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('category', productData.category);
    formData.append('sku', skuToUse);
    
    if (productData.purchasePrice !== undefined) formData.append('purchasePrice', productData.purchasePrice.toString());
    if (productData.barcode) formData.append('barcode', productData.barcode);
    if (productData.brand) formData.append('brand', productData.brand);
    if (productData.description) formData.append('description', productData.description);
    if (productData.lowStockThreshold !== undefined) formData.append('lowStockThreshold', productData.lowStockThreshold.toString());

    // Image upload (optional, never blocks creation)
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await inventoryRepository.createProduct(formData);
    
    // Process mapping with business rules applied
    const status = inventoryService.calculateStockStatus(response.product.quantity, response.product.lowStockThreshold);
    return inventoryMapper.dtoToProduct(response.product, status);
  }
};
