import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/subscription.api';

// --- Packages Hooks ---
export const usePackages = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => api.getPackages(params),
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useArchivePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.archivePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

// --- Subscriptions Hooks ---
export const useSubscriptions = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => api.getSubscriptions(params),
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => api.getSubscription(id),
    enabled: !!id,
  });
};

export const useSubscriptionDashboard = () => {
  return useQuery({
    queryKey: ['subscription-dashboard'],
    queryFn: () => api.getDashboardStats(),
  });
};

// Reports
export const useRevenueReport = (filters?: any) => {
  return useQuery({
    queryKey: ['subscription-reports', 'revenue', filters],
    queryFn: () => api.getRevenueReport(filters),
  });
};

export const usePackagePerformanceReport = (filters?: any) => {
  return useQuery({
    queryKey: ['subscription-reports', 'packages', filters],
    queryFn: () => api.getPackagePerformanceReport(filters),
  });
};

export const useExpiryReport = (filters?: any) => {
  return useQuery({
    queryKey: ['subscription-reports', 'expiry', filters],
    queryFn: () => api.getExpiryReport(filters),
  });
};

export const useSubscriptionHistory = (id: string) => {
  return useQuery({
    queryKey: ['subscription-history', id],
    queryFn: () => api.getSubscriptionHistory(id),
    enabled: !!id,
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.renewSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', variables.id] });
    },
  });
};

export const useSuspendSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.suspendSubscription(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', variables.id] });
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.resumeSubscription,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', id] });
    },
  });
};

// --- Payment Requests Hooks ---
export const usePaymentRequests = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['payment-requests', params],
    queryFn: () => api.getPaymentRequests(params),
  });
};

export const useApprovePaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.approvePaymentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useRejectPaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectPaymentRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });
};
