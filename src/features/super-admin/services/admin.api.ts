import axiosInstance from '@/lib/api/axios';

export interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  v1PlainPassword?: string;
  role: "SHOP_ADMIN" | "ADMIN" | "ORGANIZATION_ADMIN";
  status: "pending" | "active" | "suspended";
  tenantId?: string;
  tenantName?: string;
  createdAt: string;
}

export interface Tenant {
  _id: string;
  name: string;
  businessType: string;
  status: "pending" | "active" | "suspended" | "deleted";
  subscriptionPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  v1PlainPassword?: string;
  approvedBy?: { _id: string; name: string; email: string } | null;
  approvedAt?: string | null;
  suspendedBy?: string | null;
  suspendedAt?: string | null;
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
    const response = await axiosInstance.get<{ success: boolean; data: DashboardStats }>('/api/v1/admin/stats');
    return response.data.data;
  },

  getPendingShopAdmins: async (): Promise<PendingAdmin[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PendingAdmin[] }>('/api/v1/admin/shop-admins/pending');
    return response.data.data;
  },

  getPendingOrgAdmins: async (): Promise<PendingAdmin[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PendingAdmin[] }>('/api/v1/admin/org-admins/pending');
    return response.data.data;
  },

  getPendingTenants: async (): Promise<Tenant[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tenant[] }>('/api/v1/admin/tenants/pending');
    return response.data.data;
  },

  getActiveTenants: async (): Promise<Tenant[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tenant[] }>('/api/v1/admin/tenants?status=active');
    return response.data.data;
  },

  getSuspendedTenants: async (): Promise<Tenant[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tenant[] }>('/api/v1/admin/tenants?status=suspended');
    return response.data.data;
  },

  getTenantById: async (tenantId: string): Promise<Tenant> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tenant }>(`/api/v1/admin/tenants/${tenantId}`);
    return response.data.data;
  },

  approveUser: async ({ userId, password }: { userId: string; password?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/users/${userId}/approve`, { password });
  },

  suspendUser: async ({ userId, password }: { userId: string; password?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/users/${userId}/suspend`, { password });
  },

  rejectUser: async ({ userId, password, reason }: { userId: string; password?: string; reason?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/users/${userId}/reject`, { password, reason });
  },

  approveTenant: async ({ tenantId, password, subscriptionPlan }: { tenantId: string; password?: string; subscriptionPlan?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/tenants/${tenantId}/approve`, { password, subscriptionPlan });
  },

  suspendTenant: async ({ tenantId, password }: { tenantId: string; password?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/tenants/${tenantId}/suspend`, { password });
  },

  restoreTenant: async ({ tenantId, password }: { tenantId: string; password?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/tenants/${tenantId}/restore`, { password });
  },

  deleteTenant: async ({ tenantId, password }: { tenantId: string; password?: string }): Promise<void> => {
    await axiosInstance.delete(`/api/v1/admin/tenants/${tenantId}`, { data: { password } });
  },

  rejectTenant: async ({ tenantId, password, reason }: { tenantId: string; password?: string; reason?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/v1/admin/tenants/${tenantId}/reject`, { password, reason });
  },

  hardDeleteTenant: async ({ tenantId, password }: { tenantId: string; password?: string }): Promise<void> => {
    await axiosInstance.delete(`/api/v1/admin/tenants/${tenantId}/hard-delete`, { data: { password } });
  }
};
