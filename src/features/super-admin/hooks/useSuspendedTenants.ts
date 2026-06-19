import { useQuery } from '@tanstack/react-query';
import { adminApi, Tenant } from '../services/admin.api';

export const useSuspendedTenants = () => {
  return useQuery<Tenant[], Error>({
    queryKey: ['admin', 'suspended-tenants'],
    queryFn: adminApi.getSuspendedTenants,
  });
};
