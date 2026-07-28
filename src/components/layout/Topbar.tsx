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
import { useInventoryUIStore } from '@/features/inventory/store/inventory-ui.store';

interface TopbarProps {
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const Topbar = ({ setMobileMenuOpen }: TopbarProps) => {
  const forceSync = selectForceSync();
  const inventoryStatus = selectStatus();
  const isSyncing = inventoryStatus === 'loading';

  return (
    <header className="sticky top-0 z-[var(--z-fixed)] flex h-12 flex-shrink-0 bg-surface/80 backdrop-blur-md border-b border-border transition-colors duration-fast">
      <button
        type="button"
        className="border-r border-border px-4 text-text-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus-ring lg:hidden"
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
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">New Sale</span>
            <span className="sm:hidden">Sale</span>
          </Link>
          {/* Add Product Button */}
          <button
            onClick={() => useInventoryUIStore.getState().setAddProductOpen(true)}
            title="Add Product"
            className="hidden md:flex items-center p-2 text-text-secondary bg-surface border border-border rounded-md shadow-sm hover:bg-surface-hover transition-colors"
          >
            <Plus className="h-5 w-5 text-primary" />
          </button>

          {/* Sync Inventory Button */}
          <button
            onClick={() => forceSync()}
            disabled={isSyncing}
            title="Sync Inventory"
            className="hidden md:flex items-center p-2 text-text-secondary bg-surface border border-border rounded-md shadow-sm hover:bg-surface-hover transition-colors disabled:opacity-disabled"
          >
            <RefreshCw className={`h-5 w-5 text-info ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => useExpensesStore.getState().setGlobalModalOpen(true)}
            title="Add Expense"
            className="hidden md:flex items-center p-2 text-text-secondary bg-surface border border-border rounded-md shadow-sm hover:bg-surface-hover transition-colors"
          >
            <ReceiptText className="h-5 w-5 text-danger" />
          </button>

          {/* Download / Open App */}
          <DesktopAppButton />
          <button
            type="button"
            className="relative rounded-full bg-surface p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 transition-colors border border-transparent hidden sm:block"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-surface bg-danger" />
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
