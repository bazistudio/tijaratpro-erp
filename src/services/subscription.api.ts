import axiosInstance from '@/lib/api/axios';
import { PackageData } from './package.api';

export interface SubscriptionData {
  _id: string;
  ownerType: 'ORGANIZATION' | 'SHOP';
  ownerId: string;
  packageId: PackageData | string;
  subscriptionPrice: number;
  currency: string;
  discount: number;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'REJECTED';
  startDate: string;
  expiryDate: string;
  lastRenewalDate: string;
  remainingDays: number; // Virtual field
  isSuspended: boolean;
  suspendReason: string;
}

export interface SubscriptionHistoryData {
  _id: string;
  subscriptionId: string;
  action: string;
  oldExpiry: string;
  newExpiry: string;
  performedBy: any;
  notes: string;
  createdAt: string;
}

export interface PaymentRequestData {
  _id: string;
  ownerType: string;
  ownerId: string;
  packageId: PackageData | string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string;
  createdAt: string;
}

export const subscriptionApi = {
  getSubscriptions: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: SubscriptionData[]; total: number }>('/api/v1/subscriptions');
    return response.data;
  },
  getSubscription: async (id: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: SubscriptionData }>(`/api/v1/subscriptions/${id}`);
    return response.data;
  },
  createSubscription: async (data: any) => {
    const response = await axiosInstance.post<{ success: boolean; data: SubscriptionData }>('/api/v1/subscriptions', data);
    return response.data;
  },
  suspendSubscription: async (id: string, reason: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: SubscriptionData }>(`/api/v1/subscriptions/${id}/suspend`, { reason });
    return response.data;
  },
  resumeSubscription: async (id: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: SubscriptionData }>(`/api/v1/subscriptions/${id}/resume`);
    return response.data;
  },
  renewSubscription: async (id: string, paymentRequestId: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: SubscriptionData }>(`/api/v1/subscriptions/${id}/renew`, { paymentRequestId });
    return response.data;
  },
  getHistory: async (id: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: SubscriptionHistoryData[] }>(`/api/v1/subscriptions/${id}/history`);
    return response.data;
  },
  // Payment Requests
  getPaymentRequests: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: PaymentRequestData[] }>('/api/v1/subscriptions/payment-requests/all');
    return response.data;
  },
  createPaymentRequest: async (data: any) => {
    const response = await axiosInstance.post<{ success: boolean; data: PaymentRequestData }>('/api/v1/subscriptions/payment-requests', data);
    return response.data;
  },
  approvePayment: async (id: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: PaymentRequestData }>(`/api/v1/subscriptions/payment-requests/${id}/approve`);
    return response.data;
  },
  rejectPayment: async (id: string, reason: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: PaymentRequestData }>(`/api/v1/subscriptions/payment-requests/${id}/reject`, { reason });
    return response.data;
  }
};
