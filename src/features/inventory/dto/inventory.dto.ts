// src/features/inventory/dto/inventory.dto.ts

export interface ProductCategoryDTO {
  _id: string;
  name: string;
}

export interface ProductDTO {
  _id: string;
  name: string;
  price: number;
  purchasePrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  reservedStock?: number;
  lowStockThreshold: number;
  category: ProductCategoryDTO | string;
  brand?: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsDTO {
  products: ProductDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdjustStockResponseDTO {
  success: boolean;
  message?: string;
  newStock?: number;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  quantity: number;
  category: string;
  purchasePrice?: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  description?: string;
  lowStockThreshold?: number;
}

