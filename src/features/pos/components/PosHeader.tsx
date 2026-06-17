'use client';

import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/usePosStore';
import { Plus, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const PosHeader = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { saleTabs, createSaleTab, clearAllSessions } = usePosStore();
  const router = useRouter();

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClosePos = () => {
    // Check if any tab is processing
    const isProcessing = saleTabs.some(tab => tab.status === 'processing');
    if (isProcessing) {
      alert("A sale is currently processing. Please wait for it to complete before closing the POS.");
      return;
    }

    if (confirm("Are you sure you want to close the POS? This will clear all active tabs.")) {
      clearAllSessions();
      router.push('/dashboard');
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 z-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400" title="Back to Dashboard (Preserves POS Session)">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#006970] dark:text-[#008990]">TijaratPro POS</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Cashier: Admin • <span className="font-semibold text-[#006970] dark:text-[#00B4BB]">Sales Active: {saleTabs.length}/3</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
          </p>
        </div>

        <button
          onClick={createSaleTab}
          disabled={saleTabs.length >= 3}
          className="flex items-center gap-2 rounded-lg bg-[#006970] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005a60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#006970] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Sale</span>
        </button>

        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <button
          onClick={handleClosePos}
          className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Close POS</span>
        </button>
      </div>
    </header>
  );
};
