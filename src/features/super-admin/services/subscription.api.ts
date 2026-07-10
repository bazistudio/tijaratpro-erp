import axiosInstance from '@/lib/api/axios';

export interface Subscription {
  _id: string;
  ownerType: 'ORGANIZATION' | 'SINGLE_SHOP';
  ownerId: any;
  packageId: any;
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  durationValue: number;
  durationType: 'days' | 'months' | 'years';
  price: number;
  limits: any;
  enabledModules: string[];
  createdAt: string;
}

export interface PaymentRequest {
  _id: string;
  organizationId: any;
  subscriptionId?: any;
  packageId?: any;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  paymentProofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  createdAt: string;
}

export const subscriptionApi = {
  getSubscriptions: async (ownerId?: string): Promise<Subscription[]> => {
    const url = ownerId ? `/api/v1/subscriptions?ownerId=${ownerId}` : '/api/v1/subscriptions';
    const response = await axiosInstance.get<{ success: boolean; data: Subscription[] }>(url);
    return response.data.data;
  },

  getPaymentRequests: async (): Promise<PaymentRequest[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PaymentRequest[] }>('/api/v1/subscriptions/payment-requests/all');
    return response.data.data;
  },

  approvePayment: async (id: string): Promise<void> => {
    await axiosInstance.post(`/api/v1/subscriptions/payment-requests/${id}/approve`);
  },

  rejectPayment: async (id: string, reason?: string): Promise<void> => {
    await axiosInstance.post(`/api/v1/subscriptions/payment-requests/${id}/reject`, { reason });
  },

  renewSubscription: async (id: string, payload: any): Promise<void> => {
    await axiosInstance.post(`/api/v1/subscriptions/${id}/renew`, payload);
  }
};
