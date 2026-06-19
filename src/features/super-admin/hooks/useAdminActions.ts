import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin.api';

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
  });
};

export const useApproveTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.approveTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
  });
};

export const useSuspendTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.suspendTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'active-tenants'] });
    },
  });
};

export const useRestoreTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.restoreTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suspended-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'active-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suspended-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
  });
};
