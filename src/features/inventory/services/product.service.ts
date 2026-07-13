import axiosInstance from '@/lib/api/axios';
import { retry } from '@/shared/lib/retry';
import { RETRY_COUNT } from '../constants/inventory.constants';
import { InventoryProduct, PaginationParams } from '../types';

export const productService = {
  getProducts: async (params: PaginationParams): Promise<{ products: InventoryProduct[], total: number }> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.brandId) query.append('brandId', params.brandId);
    if (params.companyId) query.append('companyId', params.companyId);
    if (params.colorId) query.append('colorId', params.colorId);
    if (params.qualityId) query.append('qualityId', params.qualityId);

    const response = await retry(() => axiosInstance.get(`/api/v1/products/my-products?${query.toString()}`), RETRY_COUNT);
    const data = response.data;
    
    // The backend might return { data: [], pagination: {} } or { products: [], total: 0 }
    // Adjusting based on standard V4 response: { data: [...], pagination: { total, ... } }
    const items = data.data || data.products || [];
    const total = data.pagination?.total || data.total || 0;
    
    return {
      products: items.map((p: any) => ({
        id: p._id,
        name: p.name,
        sku: p.sku || '',
        category: p.category?.name || 'Uncategorized',
        categoryId: p.categoryId,
        brand: p.brand?.name || '',
        brandId: p.brandId,
        company: p.company?.name || '',
        companyId: p.companyId,
        color: p.color?.name || '',
        colorId: p.colorId,
        quality: p.quality?.name || '',
        qualityId: p.qualityId,
        stock: p.currentStock || 0,
        minStockThreshold: p.minStock || 0,
        price: p.salePrice || 0,
        purchasePrice: p.purchasePrice || 0,
        status: p.currentStock > (p.minStock || 0) ? 'HEALTHY' : p.currentStock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
      })) as InventoryProduct[],
      total,
    };
  },

  createProduct: async (productData: any): Promise<InventoryProduct> => {
    const response = await axiosInstance.post('/api/v1/products', productData);
    return response.data.product;
  }
};
