import React from 'react';
import { ShopAdminDashboardLayout } from '../../../dashboards/shop-admin/ShopAdminDashboardLayout';
import { ShopAdminDashboard } from '../../../dashboards/shop-admin/ShopAdminDashboard';

export default function ShopAdminPage() {
  return (
    <ShopAdminDashboardLayout>
      <ShopAdminDashboard />
    </ShopAdminDashboardLayout>
  );
}