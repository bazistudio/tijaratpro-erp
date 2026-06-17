'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, ShoppingCart, Package, Receipt, Wrench, UserPlus, ChevronDown } from 'lucide-react';

export const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-2 rounded-full bg-[#006970] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006970] transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        Quick Actions
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-900 py-2 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-800 focus:outline-none">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Create New
          </div>

          <Link
            href="/dashboard/shop-admin/products/new"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Package className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970]" />
            Add Product
          </Link>
          <Link
            href="/dashboard/shop-admin/expenses/new"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Receipt className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970]" />
            Add Expense
          </Link>
          <Link
            href="/dashboard/shop-admin/repairs/new"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Wrench className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970]" />
            Create Repair Job
          </Link>
          <Link
            href="/dashboard/shop-admin/customers/new"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <UserPlus className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970]" />
            Add Customer
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
