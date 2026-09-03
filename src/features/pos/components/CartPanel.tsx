'use client';

import React, { useState, useEffect } from 'react';
import { CustomerSelector } from './CustomerSelector';
import { CartTable } from './CartTable';
import { CartSummary } from './CartSummary';
import { DBCustomer } from '@/types/db.types';
import { usePosStore } from '../store/usePosStore';
import { useSearchParams } from 'next/navigation';
import { customerApi } from '@/services/customer.api';

export const CartPanel: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<DBCustomer | null>(null);
  const activeSession = usePosStore((s) => s.getActiveSession());
  const searchParams = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customerId');

  // Load customer if URL parameter exists
  useEffect(() => {
    if (preSelectedCustomerId) {
      customerApi
        .getCustomerDetail(preSelectedCustomerId)
        .then((res) => {
          if (res.data?.customer) {
            setSelectedCustomer({
              ...res.data.customer,
              currentBalance: res.data.stats?.outstanding || 0,
            });
          }
        })
        .catch((err) => console.error('Failed to load preselected customer', err));
    }
  }, [preSelectedCustomerId]);

  // Sync session customer from active tab
  useEffect(() => {
    const sessionId = activeSession?.customer?.id;
    if (sessionId && sessionId !== 'walk-in') {
      if (!selectedCustomer || selectedCustomer.id !== sessionId) {
        customerApi
          .getCustomerDetail(sessionId)
          .then((res) => {
            if (res.data?.customer) {
              setSelectedCustomer({
                ...res.data.customer,
                currentBalance: res.data.stats?.outstanding || 0,
              });
            }
          })
          .catch((err) => console.error('Failed to sync session customer', err));
      }
    } else if (sessionId === 'walk-in' || !sessionId) {
      if (selectedCustomer) {
        setSelectedCustomer(null);
      }
    }
  }, [activeSession?.customer?.id]);

  const handleSelectCustomer = (customer: DBCustomer | null) => {
    setSelectedCustomer(customer);
    const { saleTabs, activeTabId } = usePosStore.getState();
    usePosStore.setState({
      saleTabs: saleTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return {
          ...tab,
          customer: customer ? { id: customer.id, name: customer.name } : null,
        };
      }),
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      {/* 1. Customer Selector at the Top */}
      <div className="p-2 border-b border-border/70 shrink-0 bg-surface-hover/20">
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
        />
      </div>

      {/* 2. Cart Items Table in the Middle */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CartTable />
      </div>

      {/* 3. Financial Summary & Checkout Footer at the Bottom */}
      <div className="shrink-0 border-t border-border/70">
        <CartSummary
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={handleSelectCustomer}
        />
      </div>
    </div>
  );
};

export default CartPanel;
