import { useQuery } from '@tanstack/react-query';
import { adminApi, PendingAdmin } from '../services/admin.api';

export const usePendingUsers = () => {
  return useQuery<PendingAdmin[], Error>({
    queryKey: ['admin', 'pending-users'],
    queryFn: adminApi.getPendingAdmins,
  });
};
