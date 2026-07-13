import axiosInstance from '@/lib/api/axios';
import { retry } from '@/shared/lib/retry';
import { RETRY_COUNT } from '../constants/inventory.constants';
import { ProductColor } from '../types';

export const colorService = {
  getColors: async (): Promise<ProductColor[]> => {
    const response = await retry(() => axiosInstance.get('/colors'), RETRY_COUNT);
    const dtos = response.data.data || response.data || [];
    return dtos.map((dto: any) => ({
      id: dto._id,
      name: dto.name,
      organizationId: dto.organizationId
    }));
  },
  
  createColor: async (data: { name: string, organizationId?: string }): Promise<ProductColor> => {
    const response = await axiosInstance.post('/colors', data);
    const dto = response.data.data;
    return {
      id: dto._id,
      name: dto.name,
      organizationId: dto.organizationId
    };
  }
};
