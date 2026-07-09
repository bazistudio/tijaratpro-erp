import api from '@/lib/api/axios';
import { Package, Subscription, PaymentRequest, SubscriptionHistory } from '../types/subscription.types';

// ==========================================
// Packages
// ==========================================
export const getPackages = async (params?: Record<string, any>) => {
  const response = await api.get('/api/v1/packages', { params });
  return response.data;
};

export const createPackage = async (data: Partial<Package>) => {
  const response = await api.post('/api/v1/packages', data);
  return response.data;
};

export const updatePackage = async (id: string, data: Partial<Package>) => {
  const response = await api.put(`/api/v1/packages/${id}`, data);
  return response.data;
};

export const archivePackage = async (id: string) => {
  const response = await api.delete(`/api/v1/packages/${id}`);
  return response.data;
};

// ==========================================
// Subscriptions
// ==========================================
export const getSubscriptions = async (params?: Record<string, any>) => {
  const response = await api.get('/api/v1/subscriptions', { params });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/api/v1/subscriptions/dashboard');
  return response.data;
};

// Reports
export const getRevenueReport = async (params?: any) => {
  const response = await api.get('/api/v1/subscriptions/reports/revenue', { params });
  return response.data;
};

export const getPackagePerformanceReport = async (params?: any) => {
  const response = await api.get('/api/v1/subscriptions/reports/packages', { params });
  return response.data;
};

export const getExpiryReport = async (params?: any) => {
  const response = await api.get('/api/v1/subscriptions/reports/expiry', { params });
  return response.data;
};

export const getSubscription = async (id: string) => {
  const response = await api.get(`/api/v1/subscriptions/${id}`);
  return response.data;
};

export const renewSubscription = async (id: string, data: { paymentRequestId?: string }) => {
  const response = await api.post(`/api/v1/subscriptions/${id}/renew`, data);
  return response.data;
};

export const suspendSubscription = async (id: string, reason: string) => {
  const response = await api.post(`/api/v1/subscriptions/${id}/suspend`, { reason });
  return response.data;
};

export const resumeSubscription = async (id: string) => {
  const response = await api.post(`/api/v1/subscriptions/${id}/resume`);
  return response.data;
};

export const customizeSubscription = async (id: string, data: any) => {
  const response = await api.patch(`/api/v1/subscriptions/${id}/customize`, data);
  return response.data;
};

export const getSubscriptionHistory = async (id: string) => {
  const response = await api.get(`/api/v1/subscriptions/${id}/history`);
  return response.data;
};

// ==========================================
// Payment Requests
// ==========================================
export const getPaymentRequests = async (params?: Record<string, any>) => {
  const response = await api.get('/api/v1/subscriptions/payment-requests/all', { params });
  return response.data;
};

export const createPaymentRequest = async (data: Partial<PaymentRequest>) => {
  const response = await api.post('/api/v1/subscriptions/payment-requests', data);
  return response.data;
};

export const approvePaymentRequest = async (id: string) => {
  const response = await api.post(`/api/v1/subscriptions/payment-requests/${id}/approve`);
  return response.data;
};

export const rejectPaymentRequest = async (id: string, reason: string) => {
  const response = await api.post(`/api/v1/subscriptions/payment-requests/${id}/reject`, { reason });
  return response.data;
};

// ==========================================
// Organization Limits
// ==========================================
export const getOrganizationLimits = async (organizationId: string) => {
  const response = await api.get(`/api/v1/organizations/${organizationId}/limits`);
  return response.data;
};

export const updateOrganizationLimits = async (organizationId: string, limits: any) => {
  const response = await api.patch(`/api/v1/organizations/${organizationId}/limits`, limits);
  return response.data;
};
