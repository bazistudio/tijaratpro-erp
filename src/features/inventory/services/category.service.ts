import axiosInstance from '@/lib/api/axios';
import { retry } from '@/shared/lib/retry';
import { RETRY_COUNT } from '../constants/inventory.constants';
import { ProductCategory } from '../types';

export const categoryService = {
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await retry(() => axiosInstance.get('/categories'), RETRY_COUNT);
    const dtos = response.data.data || response.data || [];
    return dtos.map((dto: any) => ({
      id: dto._id,
      name: dto.name,
      organizationId: dto.organizationId
    }));
  },
  
  createCategory: async (data: { name: string, organizationId?: string }): Promise<ProductCategory> => {
    const response = await axiosInstance.post('/categories', data);
    const dto = response.data.data;
    return {
      id: dto._id,
      name: dto.name,
      organizationId: dto.organizationId
    };
  }
};
