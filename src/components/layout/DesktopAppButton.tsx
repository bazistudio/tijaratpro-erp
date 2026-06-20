'use client';

import React, { useEffect, useState } from 'react';
import { Download, MonitorPlay } from 'lucide-react';
import { isElectron } from '@/lib/electron/is-electron';

export const DesktopAppButton = () => {
  const [appState, setAppState] = useState<'DOWNLOAD' | 'OPEN' | 'HIDDEN'>('HIDDEN');

  useEffect(() => {
    // If we are already running inside the Electron app, we don't need this button
    if (isElectron()) {
      setAppState('HIDDEN');
      return;
    }

    // Check if user has previously downloaded the app
    const hasDownloaded = localStorage.getItem('tijaratpro_desktop_installed') === 'true';
    if (hasDownloaded) {
      setAppState('OPEN');
    } else {
      setAppState('DOWNLOAD');
    }
  }, []);

  const handleAction = () => {
    if (appState === 'DOWNLOAD') {
      // Trigger download (In a real scenario, this would link to your .exe / .dmg release)
      window.open('https://github.com/tijaratpro/desktop-app/releases/latest', '_blank');
      
      // Assume they install it, switch to OPEN state
      localStorage.setItem('tijaratpro_desktop_installed', 'true');
      setAppState('OPEN');
    } else if (appState === 'OPEN') {
      // Trigger deep link protocol to open the local Electron app
      window.location.href = 'tijaratpro://';
    }
  };

  if (appState === 'HIDDEN') return null;

  return (
    <button
      onClick={handleAction}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
        appState === 'OPEN' 
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
      }`}
    >
      {appState === 'OPEN' ? (
        <>
          <MonitorPlay className="h-4 w-4" />
          <span className="hidden lg:inline">Open App</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden lg:inline">Download App</span>
        </>
      )}
    </button>
  );
};
