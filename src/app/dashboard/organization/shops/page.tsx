'use client';

import React, { useState, useEffect } from 'react';
import { shopApi, ShopData } from '@/services/shop.api';
import { AddShopModal } from '@/features/organization/components/shops/AddShopModal';
import { Store, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function ShopsManagementPage() {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await shopApi.getAllShops();
      if (res.success) {
        setShops(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch shops', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shops Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all branches within your organization</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#006970] text-white px-4 py-2 flex items-center gap-2 rounded-md hover:bg-[#005a60] transition-colors shadow-sm"
        >
          <Store className="w-4 h-4" />
          Add Shop
        </button>
      </div>

      <AddShopModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchShops} 
      />

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <Loader2 className="w-8 h-8 animate-spin text-[#006970]" />
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No shops found</h3>
          <p className="text-gray-500 mb-6">You haven't created any shops yet. Add your first shop to get started.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[#006970] font-medium hover:underline"
          >
            Create your first shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{shop.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${shop.status === 'active' || shop.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {shop.status === 'active' || shop.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {shop.status}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-[#006970]/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#006970]" />
                </div>
              </div>
              <div className="p-5 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                {shop.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {(shop.city || shop.address) && (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {shop.address}{shop.address && shop.city ? ', ' : ''}{shop.city}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
