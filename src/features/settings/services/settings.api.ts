import axiosInstance from '@/lib/api/axios';

export const settingsApi = {
  getStaff: async () => {
    const response = await axiosInstance.get('/api/v1/settings/staff');
    return response.data;
  },
  
  createStaff: async (data: any) => {
    const response = await axiosInstance.post('/api/v1/settings/staff', data);
    return response.data;
  },

  updateStaff: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/api/v1/settings/staff/${id}`, data);
    return response.data;
  },

  getRoles: async () => {
    const response = await axiosInstance.get('/api/v1/settings/roles');
    return response.data;
  },

  updateRole: async (roleId: string, permissions: Record<string, boolean>) => {
    const response = await axiosInstance.put(`/api/v1/settings/roles/${roleId}`, { permissions });
    return response.data;
  }
};
