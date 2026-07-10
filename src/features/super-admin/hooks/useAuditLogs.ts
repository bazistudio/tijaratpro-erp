import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/api/axios';

export interface AuditLog {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string };
  tenantId: string;
  action: string;
  resource: string;
  metadata?: any;
  createdAt: string;
}

export const useAuditLogs = (limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', limit, page],
    queryFn: async () => {
      const response = await axiosInstance.get<{ success: boolean; data: AuditLog[]; pagination: any }>(
        `/api/v1/admin/audit-logs?limit=${limit}&page=${page}`
      );
      return response.data;
    },
  });
};
