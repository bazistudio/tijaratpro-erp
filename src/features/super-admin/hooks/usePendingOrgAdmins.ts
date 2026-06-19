import { useQuery } from '@tanstack/react-query';
import { adminApi, PendingAdmin } from '../services/admin.api';

export const usePendingOrgAdmins = () => {
  return useQuery<PendingAdmin[], Error>({
    queryKey: ['admin', 'pending-org-admins'],
    queryFn: adminApi.getPendingOrgAdmins,
  });
};
