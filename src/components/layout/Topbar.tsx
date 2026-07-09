'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell, ShoppingCart, PackagePlus, ReceiptText, RefreshCw, Plus } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { SearchInput } from '../common/SearchInput';
import { DesktopAppButton } from './DesktopAppButton';
import { ThemeToggle } from './ThemeToggle';
import { ShopSwitcher } from './ShopSwitcher';
import { selectForceSync, selectStatus } from '@/features/inventory/core/inventory.selectors';
import { useExpensesStore } from '@/features/expenses';

interface TopbarProps {
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const Topbar = ({ setMobileMenuOpen }: TopbarProps) => {
  const forceSync = selectForceSync();
  const inventoryStatus = selectStatus();
  const isSyncing = inventoryStatus === 'loading';

  return (
    <header className="sticky top-0 z-[60] flex h-12 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <button
        type="button"
        className="border-r border-gray-200 dark:border-gray-800 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006970] lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8 min-w-0">
        
        <div className="flex flex-1 min-w-0 max-w-3xl items-center gap-4">
          <SearchInput placeholder="Search products, customers, invoices..." />
          <div className="hidden md:block">
            <ShopSwitcher />
          </div>
        </div>
        
        <div className="ml-4 flex flex-shrink-0 items-center gap-2 md:gap-4">
          
          {/* Fixed Sale Button */}
          <Link
            href="/dashboard/shop-admin/pos"
            className="flex items-center gap-2 rounded-full bg-[#006970] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006970] transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">New Sale</span>
            <span className="sm:hidden">Sale</span>
          </Link>
          {/* Add Product Button */}
          <Link
            href="/dashboard/shop-admin/products/new"
            title="Add Product"
            className="hidden md:flex items-center p-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-5 w-5 text-[#006970] dark:text-emerald-400" />
          </Link>

          {/* Sync Inventory Button */}
          <button
            onClick={() => forceSync()}
            disabled={isSyncing}
            title="Sync Inventory"
            className="hidden md:flex items-center p-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => useExpensesStore.getState().setGlobalModalOpen(true)}
            title="Add Expense"
            className="hidden md:flex items-center p-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ReceiptText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </button>

          {/* Download / Open App */}
          <DesktopAppButton />
          <button
            type="button"
            className="relative rounded-full bg-white dark:bg-gray-900 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006970] focus:ring-offset-2 transition-colors border border-transparent dark:border-gray-700 hidden sm:block"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full  ring-2 ring-white dark:ring-gray-900" />
          </button>

          {/* Theme Toggle & User Profile Menu */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
