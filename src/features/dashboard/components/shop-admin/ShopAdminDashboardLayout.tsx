'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useSyncEngine } from '@/features/realtime-sync/hooks/useSyncEngine';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';

interface ShopAdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const ShopAdminDashboardLayout = ({ children }: ShopAdminDashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize Real-Time Sync Engine for the entire dashboard
  useSyncEngine();
  
  // Initialize Global Dashboard Shortcuts
  useDashboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex w-0 flex-1 flex-col lg:pl-64 transition-all duration-200">
        {/* Topbar */}
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />

        {/* Dashboard Content Area */}
        <DashboardShell>
          {children}
        </DashboardShell>
      </div>
    </div>
  );
};

export default ShopAdminDashboardLayout;
