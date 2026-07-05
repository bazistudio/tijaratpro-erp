'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building, Store, Loader2 } from 'lucide-react';
import { useOrganizationStore, Shop } from '@/store/useOrganizationStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // Assuming you have an axios instance

export const ShopSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { 
    activeOrganization, 
    activeOrganizationId,
    activeShop, 
    viewMode, 
    setActiveContext,
    setActiveShop
  } = useOrganizationStore();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch shops when dropdown opens
  useEffect(() => {
    if (isOpen && activeOrganizationId && shops.length === 0) {
      const fetchShops = async () => {
        try {
          // Assuming you have an endpoint that returns shops for the active organization
          const res = await api.get(`/api/shops`);
          if (res.data?.success) {
            setShops(res.data.data);
          }
        } catch (error) {
          console.error("Failed to load shops", error);
        }
      };
      fetchShops();
    }
  }, [isOpen, activeOrganizationId]);

  if (!activeOrganizationId) return null;

  const handleContextSwitch = async (shopId: string | null, path: string) => {
    // Optimistic UI Rollback Cache
    const prevContext = {
      viewMode,
      activeShop
    };

    setIsLoading(true);
    setIsOpen(false);

    // Optimistically update state
    setActiveContext(activeOrganizationId!, shopId);
    if (shopId) {
      const selected = shops.find(s => s._id === shopId);
      if (selected) setActiveShop(selected);
    } else {
      setActiveShop(null);
    }

    try {
      await api.post('/api/auth/switch-context', {
        organizationId: activeOrganizationId,
        shopId: shopId
      });
      
      router.push(path);
    } catch (error) {
      console.error("Failed to switch context", error);
      // Rollback on failure
      setActiveContext(activeOrganizationId!, prevContext.viewMode === 'shop' ? prevContext.activeShop?._id || null : null);
      setActiveShop(prevContext.activeShop);
      // Fallback UI error handling here (e.g. toast)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAllShops = () => {
    handleContextSwitch(null, '/dashboard/organization');
  };

  const handleSelectShop = (shop: Shop) => {
    handleContextSwitch(shop._id, '/dashboard/shop-admin');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006970] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        ) : (
          <Building className="w-4 h-4 text-gray-500" />
        )}
        <span className="truncate max-w-[120px]">
          {viewMode === 'organization' ? 'All Shops' : activeShop?.name || 'Loading...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
              {activeOrganization?.name || 'Current Organization'}
            </div>
            
            <button
              onClick={handleSelectAllShops}
              className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                viewMode === 'organization' 
                  ? 'bg-blue-50 text-[#006970] font-medium dark:bg-gray-700 dark:text-emerald-400' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Building className="w-4 h-4 mr-3" />
              All Shops
            </button>
            
            {shops.length === 0 ? (
               <div className="px-4 py-3 text-sm text-gray-500 text-center flex items-center justify-center">
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading shops...
               </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-700 mt-1 max-h-60 overflow-y-auto">
                {shops.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => handleSelectShop(shop)}
                    className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                      activeShop?._id === shop._id
                        ? 'bg-blue-50 text-[#006970] font-medium dark:bg-gray-700 dark:text-emerald-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Store className="w-4 h-4 mr-3 shrink-0" />
                    <span className="truncate">{shop.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
