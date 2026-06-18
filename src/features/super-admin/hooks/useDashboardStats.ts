import { useQuery } from '@tanstack/react-query';
import { adminApi, DashboardStats } from '../services/admin.api';

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
  });
};
