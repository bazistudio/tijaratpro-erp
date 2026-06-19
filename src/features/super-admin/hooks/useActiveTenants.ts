import { useQuery } from '@tanstack/react-query';
import { adminApi, Tenant } from '../services/admin.api';

export const useActiveTenants = () => {
  return useQuery<Tenant[], Error>({
    queryKey: ['admin', 'active-tenants'],
    queryFn: adminApi.getActiveTenants,
  });
};
