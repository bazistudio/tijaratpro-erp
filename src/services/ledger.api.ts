import axiosInstance from '@/lib/api/axios';
import { DBLedgerEntry } from '@/types/db.types';

export const ledgerApi = {
  getCustomerLedger: async (customerId: string) => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        history: DBLedgerEntry[];
      };
      message: string;
    }>(`/api/ledger/${customerId}`);
    return response.data;
  }
};
