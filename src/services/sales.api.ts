import axiosInstance from '@/lib/api/axios';
import { DBTransaction } from '@/types/db.types';

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  customerId?: string;
  paymentMethod: string;
  taxRate?: number;
  discount?: number;
}

export const salesApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await axiosInstance.post<{
      success: boolean;
      order: any;
      message: string;
    }>('/api/orders', payload);
    return response.data;
  },

  getOrders: async (params?: { startDate?: string; endDate?: string; limit?: number; orderNumber?: string }) => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: any[];
    }>('/api/orders', { params });
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>(`/api/orders/${orderId}/status`, { status: 'cancelled' });
    return response.data;
  }
};
