// src/features/sales/services/sales.service.ts

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProductId: string | null;
  periodLabel: string;
}

export type SalesPeriod = 'today' | 'weekly' | 'monthly';

export const salesService = {
  /**
   * Calculates sales metrics for a given period.
   * This service acts as the read-only analytics layer.
   */
  getMetrics: async (period: SalesPeriod): Promise<SalesMetrics> => {
    // In Phase 4, we mock this data until the backend sales endpoints are available.
    // The strict rule is enforced: NO direct inventory store imports.
    // This service is isolated and only computes sales state.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (period === 'today') {
      return {
        totalRevenue: 45000,
        totalOrders: 12,
        averageOrderValue: 3750,
        topSellingProductId: 'mock-id-1',
        periodLabel: 'Today'
      };
    }

    if (period === 'weekly') {
      return {
        totalRevenue: 285000,
        totalOrders: 94,
        averageOrderValue: 3031,
        topSellingProductId: 'mock-id-2',
        periodLabel: 'This Week'
      };
    }

    return {
      totalRevenue: 1250000,
      totalOrders: 412,
      averageOrderValue: 3033,
        topSellingProductId: 'mock-id-3',
      periodLabel: 'This Month'
    };
  }
};
