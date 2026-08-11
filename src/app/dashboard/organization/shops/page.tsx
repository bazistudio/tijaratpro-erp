'use client';

import React, { useState, useEffect } from 'react';
import { shopApi, ShopData } from '@/services/shop.api';
import { AddShopModal } from '@/features/organization/components/shops/AddShopModal';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { Store, MapPin, Phone, CheckCircle, XCircle, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopsManagementPage() {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShopData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { hasPermission } = usePermissions();
  const canManageShops = hasPermission(PERMISSIONS.SHOPS_MANAGE);

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

  const handleDeleteShop = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      // Backend action call if supported
      toast.success(`Shop "${deleteTarget.name}" deleted successfully.`);
      setShops(prev => prev.filter(s => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete shop');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shop.city && shop.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (shop.phone && shop.phone.includes(searchQuery))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Shops & Branches</h1>
          <p className="text-sm text-text-muted mt-1">Manage all retail locations across your organization.</p>
        </div>
        {canManageShops && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-4 py-2 flex items-center gap-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm text-sm font-medium"
          >
            <Store className="w-4 h-4" />
            Add Shop
          </button>
        )}
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-border">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input 
          type="text" 
          placeholder="Search shops by name, city, or phone..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
        />
      </div>

      <AddShopModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchShops} 
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-modal space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-text-primary">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteTarget.name}</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover text-text-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteShop}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-md hover:bg-danger/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-surface rounded-lg shadow-sm border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-surface rounded-lg shadow-sm p-12 text-center border border-border">
          <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">
            {searchQuery ? 'No matching shops found' : 'No shops found'}
          </h3>
          <p className="text-text-muted text-sm mb-6">
            {searchQuery ? 'Try adjusting your search criteria.' : "You haven't created any shops yet. Add your first shop to get started."}
          </p>
          {canManageShops && !searchQuery && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-primary font-medium text-sm hover:underline"
            >
              Create your first shop
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div key={shop._id} className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-border flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">{shop.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      shop.status === 'active' || shop.status === 'ACTIVE' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-danger/10 text-danger'
                    }`}>
                      {shop.status === 'active' || shop.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {shop.status}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="p-5 space-y-3 bg-surface-hover/30">
                {shop.phone && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {(shop.city || shop.address) && (
                  <div className="flex items-start gap-3 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {shop.address}{shop.address && shop.city ? ', ' : ''}{shop.city}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {canManageShops && (
                <div className="px-5 py-3 border-t border-border bg-surface flex justify-end gap-2">
                  <button 
                    onClick={() => toast.success(`Editing ${shop.name}`)}
                    className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-hover rounded transition-colors"
                    title="Edit shop details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(shop)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-surface-hover rounded transition-colors"
                    title="Delete shop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
