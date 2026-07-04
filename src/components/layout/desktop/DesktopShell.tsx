'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isElectron } from '../../../lib/electron/is-electron';
import { TitleBar } from './TitleBar';
import { DesktopModals } from './DesktopModals';
import { useGlobalShortcuts } from '../../../hooks/useGlobalShortcuts';

export const DesktopShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<'SHORTCUTS' | 'SYSINFO' | 'ABOUT' | 'COMING_SOON' | 'DOCS' | 'SUPPORT' | null>(null);

  const runningInElectron = isElectron();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      // Modals
      case 'OPEN_SHORTCUTS':
        setActiveModal('SHORTCUTS');
        break;
      case 'OPEN_SYSINFO':
        setActiveModal('SYSINFO');
        break;
      case 'OPEN_ABOUT':
        setActiveModal('ABOUT');
        break;
      case 'BACKUP_CREATE':
      case 'BACKUP_RESTORE':
      case 'BACKUP_VERIFY':
      case 'BACKUP_OPEN_FOLDER':
        setActiveModal('COMING_SOON');
        break;

      // Navigation
      case 'GOTO_DASHBOARD':
        router.push('/dashboard');
        break;
      case 'GOTO_POS':
        router.push('/dashboard/pos');
        break;
      case 'GOTO_INVENTORY':
        router.push('/dashboard/inventory');
        break;
      case 'GOTO_CUSTOMERS':
        router.push('/dashboard/customers');
        break;
      case 'GOTO_SUPPLIERS':
        router.push('/dashboard/suppliers');
        break;
      case 'GOTO_REPORTS':
        router.push('/dashboard/reports');
        break;
      case 'NEW_SALE':
        router.push('/dashboard/pos'); // New sale is typically handled inside POS
        break;
      case 'NEW_CUSTOMER':
        router.push('/dashboard/customers?action=new');
        break;
      case 'NEW_SUPPLIER':
        router.push('/dashboard/suppliers?action=new');
        break;

      // System
      case 'CHECK_UPDATES':
        if (window.electron) window.electron.updater.checkForUpdates();
        break;
      case 'OPEN_DOCS':
        setActiveModal('DOCS');
        break;
      case 'OPEN_SUPPORT':
        setActiveModal('SUPPORT');
        break;
      case 'EXIT':
        if (window.electron) window.electron.close();
        break;
    }
  };

  useGlobalShortcuts(handleAction);

  const isDesktop = mounted && runningInElectron;

  return (
    <div className={isDesktop ? "flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0a]" : "flex flex-col min-h-screen"}>
      {/* Custom Frameless Titlebar */}
      {isDesktop && <TitleBar onMenuAction={handleAction} />}

      {/* Main Content Area */}
      <div className={isDesktop ? "flex-1 flex flex-col min-h-0 overflow-y-auto relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex-1 flex flex-col min-h-0 relative"}>
        {children}
      </div>

      {/* Shared Desktop Modals */}
      {isDesktop && <DesktopModals activeModal={activeModal} onClose={() => setActiveModal(null)} />}
    </div>
  );
};
