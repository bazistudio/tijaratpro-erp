import { useQuery } from '@tanstack/react-query';
import { adminApi, Tenant } from '../services/admin.api';

export const useTenantById = (tenantId: string) => {
  return useQuery<Tenant, Error>({
    queryKey: ['admin', 'tenant', tenantId],
    queryFn: () => adminApi.getTenantById(tenantId),
    enabled: !!tenantId,
  });
};
