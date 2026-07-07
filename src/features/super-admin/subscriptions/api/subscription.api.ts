import api from '@/lib/api';
import { Package, Subscription, PaymentRequest, SubscriptionHistory } from '../types/subscription.types';

// ==========================================
// Packages
// ==========================================
export const getPackages = async (params?: Record<string, any>) => {
  const response = await api.get('/packages', { params });
  return response.data;
};

export const createPackage = async (data: Partial<Package>) => {
  const response = await api.post('/packages', data);
  return response.data;
};

export const updatePackage = async (id: string, data: Partial<Package>) => {
  const response = await api.put(`/packages/${id}`, data);
  return response.data;
};

export const archivePackage = async (id: string) => {
  const response = await api.delete(`/packages/${id}`);
  return response.data;
};

// ==========================================
// Subscriptions
// ==========================================
export const getSubscriptions = async (params?: Record<string, any>) => {
  const response = await api.get('/subscriptions', { params });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/subscriptions/dashboard');
  return response.data;
};

// Reports
export const getRevenueReport = async (params?: any) => {
  const response = await api.get('/subscriptions/reports/revenue', { params });
  return response.data;
};

export const getPackagePerformanceReport = async (params?: any) => {
  const response = await api.get('/subscriptions/reports/packages', { params });
  return response.data;
};

export const getExpiryReport = async (params?: any) => {
  const response = await api.get('/subscriptions/reports/expiry', { params });
  return response.data;
};

export const getSubscription = async (id: string) => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

export const renewSubscription = async (id: string, data: { paymentRequestId?: string }) => {
  const response = await api.post(`/subscriptions/${id}/renew`, data);
  return response.data;
};

export const suspendSubscription = async (id: string, reason: string) => {
  const response = await api.post(`/subscriptions/${id}/suspend`, { reason });
  return response.data;
};

export const resumeSubscription = async (id: string) => {
  const response = await api.post(`/subscriptions/${id}/resume`);
  return response.data;
};

export const getSubscriptionHistory = async (id: string) => {
  const response = await api.get(`/subscriptions/${id}/history`);
  return response.data;
};

// ==========================================
// Payment Requests
// ==========================================
export const getPaymentRequests = async (params?: Record<string, any>) => {
  const response = await api.get('/subscriptions/payment-requests', { params });
  return response.data;
};

export const createPaymentRequest = async (data: Partial<PaymentRequest>) => {
  const response = await api.post('/subscriptions/payment-requests', data);
  return response.data;
};

export const approvePaymentRequest = async (id: string) => {
  const response = await api.post(`/subscriptions/payment-requests/${id}/approve`);
  return response.data;
};

export const rejectPaymentRequest = async (id: string, reason: string) => {
  const response = await api.post(`/subscriptions/payment-requests/${id}/reject`, { reason });
  return response.data;
};
