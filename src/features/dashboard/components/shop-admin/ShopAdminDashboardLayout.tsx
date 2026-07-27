'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useSyncEngine } from '@/features/realtime-sync/hooks/useSyncEngine';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

interface ShopAdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const ShopAdminDashboardLayout = ({ children }: ShopAdminDashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Initialize Real-Time Sync Engine for the entire dashboard
  useSyncEngine();
  
  // Initialize Global Dashboard Shortcuts
  useDashboardShortcuts();

  return (
    <ThemeProvider>
      <div className="flex flex-1 h-full w-full min-h-0 overflow-hidden bg-background">
        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex w-0 flex-1 flex-col transition-all duration-200">
          {/* Topbar */}
          <Topbar setMobileMenuOpen={setMobileMenuOpen} />

          {/* Dashboard Content Area */}
          <DashboardShell variant={pathname?.includes('/pos') ? 'pos' : 'default'}>
            {children}
          </DashboardShell>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ShopAdminDashboardLayout;
