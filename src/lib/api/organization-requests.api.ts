import axios from './axios';

export interface OrganizationRequest {
  _id: string;
  name: string;
  code: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  accountType: string;
  businessType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const getRequests = async (): Promise<OrganizationRequest[]> => {
  const response = await axios.get('/api/organization-requests');
  return response.data.data;
};

export const approveRequest = async (id: string) => {
  const response = await axios.post(`/api/organization-requests/${id}/approve`);
  return response.data;
};

export const rejectRequest = async (id: string, reason: string) => {
  const response = await axios.post(`/api/organization-requests/${id}/reject`, { reviewNote: reason });
  return response.data;
};
