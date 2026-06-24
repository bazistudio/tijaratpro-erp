import axiosInstance from '@/lib/api/axios';

export interface ShopData {
  _id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cashBalance: number;
  status: string;
  planId: any;
}

export const shopApi = {
  getMyShop: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: ShopData; message: string }>('/api/shops/me');
    return response.data;
  }
};
