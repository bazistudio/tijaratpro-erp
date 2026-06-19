import axiosInstance from '@/lib/api/axios';

export interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  role: "SHOP_ADMIN" | "ADMIN" | "ORGANIZATION_ADMIN";
  status: "pending" | "active" | "suspended";
  tenantId?: string;
  tenantName?: string;
  createdAt: string;
}

export interface PendingTenant {
  _id: string;
  name: string;
  businessType: string;
  status: "pending" | "active" | "suspended";
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  pendingTenants: number;
  pendingShopAdmins: number;
  pendingOrgAdmins: number;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<{ success: boolean; data: DashboardStats }>('/api/admin/stats');
    return response.data.data;
  },

  getPendingShopAdmins: async (): Promise<PendingAdmin[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PendingAdmin[] }>('/api/admin/shop-admins/pending');
    return response.data.data;
  },

  getPendingOrgAdmins: async (): Promise<PendingAdmin[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PendingAdmin[] }>('/api/admin/org-admins/pending');
    return response.data.data;
  },

  getPendingTenants: async (): Promise<PendingTenant[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PendingTenant[] }>('/api/admin/tenants/pending');
    return response.data.data;
  },

  approveUser: async (userId: string): Promise<void> => {
    await axiosInstance.patch(`/api/admin/users/${userId}/approve`);
  },

  suspendUser: async (userId: string): Promise<void> => {
    await axiosInstance.patch(`/api/admin/users/${userId}/suspend`);
  },

  approveTenant: async (tenantId: string): Promise<void> => {
    await axiosInstance.patch(`/api/admin/tenants/${tenantId}/approve`);
  },

  suspendTenant: async (tenantId: string): Promise<void> => {
    await axiosInstance.patch(`/api/admin/tenants/${tenantId}/suspend`);
  }
};
