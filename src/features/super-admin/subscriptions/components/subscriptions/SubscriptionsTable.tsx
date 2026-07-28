'use client';
import React, { useState, useMemo } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionFilters } from './SubscriptionFilters';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { Subscription } from '../../types/subscription.types';
import { SubscriptionManagementDrawer } from './SubscriptionManagementDrawer';
import Link from 'next/link';

export const SubscriptionsTable = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ownerType, setOwnerType] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // Compute expiry dates based on filter
  const { expiryBefore, expiryAfter } = useMemo(() => {
    let before: string | undefined;
    let after: string | undefined;
    const now = new Date();
    
    if (expiryFilter === '7_DAYS') {
      const target = new Date();
      target.setDate(target.getDate() + 7);
      before = target.toISOString();
      after = now.toISOString();
    } else if (expiryFilter === '30_DAYS') {
      const target = new Date();
      target.setDate(target.getDate() + 30);
      before = target.toISOString();
      after = now.toISOString();
    } else if (expiryFilter === 'EXPIRED') {
      before = now.toISOString();
    }
    
    return { expiryBefore: before, expiryAfter: after };
  }, [expiryFilter]);

  const { data, isLoading, isError, error } = useSubscriptions({
    page,
    limit,
    search,
    status: status || undefined,
    ownerType: ownerType || undefined,
    expiryBefore,
    expiryAfter
  });

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Unable to load subscriptions. {error?.message}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-sm font-semibold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-surface shadow-card rounded-xl border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Active Subscriptions</h2>
      </div>

      <SubscriptionFilters 
        search={search} setSearch={setSearch} 
        status={status} setStatus={setStatus} 
        ownerType={ownerType} setOwnerType={setOwnerType}
        expiryFilter={expiryFilter} setExpiryFilter={setExpiryFilter}
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-hover rounded"></div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-text-muted mb-2">No subscriptions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {data?.data?.map((sub: Subscription) => (
                <tr key={sub._id} className="hover:bg-surface-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{sub.ownerType}</div>
                    <div className="text-xs text-text-muted">{typeof sub.ownerId === 'string' ? sub.ownerId : sub.ownerId?._id || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">
                      {typeof sub.packageId === 'string' ? 'Package ID' : sub.packageId?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SubscriptionStatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(sub.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${sub.remainingDays <= 7 ? 'text-danger' : 'text-text-primary'}`}>
                      {sub.remainingDays} Days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedSubId(sub._id)}
                      className="text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 px-2">
          <div className="text-sm text-text-muted">
            Showing <span className="font-medium text-text-primary">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-text-primary">{Math.min(page * limit, data.pagination.total)}</span> of <span className="font-medium text-text-primary">{data.pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded text-sm text-text-secondary disabled:opacity-50 hover:bg-surface-hover hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-3 py-1 border border-border rounded text-sm text-text-secondary disabled:opacity-50 hover:bg-surface-hover hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <SubscriptionManagementDrawer 
        subscriptionId={selectedSubId}
        isOpen={!!selectedSubId}
        onClose={() => setSelectedSubId(null)}
      />
    </div>
  );
};
