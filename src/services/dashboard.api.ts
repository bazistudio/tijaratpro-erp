import axiosInstance from '@/lib/api/axios';

export interface DashboardMetrics {
  summary: {
    revenue: {
      today: number;
      thisMonth: number;
      total: number;
      growth: number;
    };
    profit: {
      today: number;
      thisMonth: number;
      total: number;
    };
    orders: {
      today: number;
      total: number;
    };
    inventory: {
      totalProducts: number;
      lowStockItems: number;
    };
    customers: {
      total: number;
      pendingPayments: number;
      totalRefunds: number;
    };
  };
  topProducts: any[];
}

export const dashboardApi = {
  getMetrics: async () => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: DashboardMetrics;
    }>('/api/dashboard/metrics');
    return response.data;
  }
};
