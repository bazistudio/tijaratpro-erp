// src/features/inventory/mappers/inventory.mapper.ts

import { InventoryProduct, StockStatus } from '../types';
import { ProductDTO } from '../dto/inventory.dto';

/**
 * Pure data transformation layer.
 * Translates between Backend DTOs and Frontend Domain Objects.
 * 
 * Note: Business rules (like calculating StockStatus) are NOT handled here.
 * The Service layer calculates those and passes them down.
 */
export const inventoryMapper = {
  dtoToProduct(dto: ProductDTO, status: StockStatus): InventoryProduct {
    const categoryName = typeof dto.category === 'object' && dto.category !== null 
      ? dto.category.name 
      : (dto.category as string || 'Uncategorized');

    return {
      id: dto._id,
      name: dto.name,
      sku: dto.sku || '',
      category: categoryName,
      stock: dto.quantity,
      minStockThreshold: dto.lowStockThreshold,
      price: dto.price,
      unit: 'pcs',
      status: status
    };
  },

  productToDto(product: Partial<InventoryProduct>): Partial<ProductDTO> {
    return {
      _id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.stock,
      lowStockThreshold: product.minStockThreshold,
    };
  }
};
