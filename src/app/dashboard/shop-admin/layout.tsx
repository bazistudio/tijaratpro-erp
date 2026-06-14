import React from 'react';
import { ShopAdminDashboardLayout } from '@/features/dashboard/components/shop-admin/ShopAdminDashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ShopAdminDashboardLayout>
      {children}
    </ShopAdminDashboardLayout>
  );
}
