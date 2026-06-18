import { useQuery } from '@tanstack/react-query';
import { adminApi, PendingTenant } from '../services/admin.api';

export const usePendingTenants = () => {
  return useQuery<PendingTenant[], Error>({
    queryKey: ['admin', 'pending-tenants'],
    queryFn: adminApi.getPendingTenants,
  });
};
