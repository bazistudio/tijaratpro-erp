import axiosInstance from '@/lib/api/axios';

export interface PackageData {
  _id: string;
  name: string;
  code: string;
  description: string;
  durationType: 'DAYS' | 'MONTHS' | 'YEARS';
  durationValue: number;
  maxBranches: number;
  maxUsers: number;
  enabledModules: string[];
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
  isTrial: boolean;
}

export const packageApi = {
  getPackages: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: PackageData[]; total: number }>('/api/v1/packages');
    return response.data;
  },
  getPackage: async (id: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: PackageData }>(`/api/v1/packages/${id}`);
    return response.data;
  },
  createPackage: async (data: Partial<PackageData>) => {
    const response = await axiosInstance.post<{ success: boolean; data: PackageData }>('/api/v1/packages', data);
    return response.data;
  },
  updatePackage: async (id: string, data: Partial<PackageData>) => {
    const response = await axiosInstance.put<{ success: boolean; data: PackageData }>(`/api/v1/packages/${id}`, data);
    return response.data;
  },
  deletePackage: async (id: string) => {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/api/v1/packages/${id}`);
    return response.data;
  }
};
