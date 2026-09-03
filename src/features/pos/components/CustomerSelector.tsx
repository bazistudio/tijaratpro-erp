'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCircle2, AlertTriangle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/services/customer.api';
import { DBCustomer } from '@/types/db.types';
import { useTenantQueryKeys } from '@/lib/react-query/useTenantQueryKeys';

interface CustomerSelectorProps {
  onSelectCustomer: (customer: DBCustomer | null) => void;
  selectedCustomer: DBCustomer | null;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({ onSelectCustomer, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const keys = useTenantQueryKeys();

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: keys.customerSearch(searchTerm),
    queryFn: () => customerApi.searchCustomers(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 60000,
  });

  const searchResults = searchResponse?.data || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer: DBCustomer) => {
    onSelectCustomer(customer);
    setSearchTerm('');
    setDropdownOpen(false);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleClear = () => {
    onSelectCustomer(null);
    setSearchTerm('');
  };

  if (selectedCustomer) {
    const { currentBalance = 0, creditLimit = 0 } = selectedCustomer;
    const availableCredit = creditLimit - currentBalance;
    const usagePercentage = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

    let statusColor = 'text-success bg-success/10 border-success/20';
    let dotColor = 'bg-success';
    let statusText = 'Safe';
    let isWarning = false;

    if (usagePercentage > 100) {
      statusColor = 'text-danger bg-danger/10 border-danger/20';
      dotColor = 'bg-danger';
      statusText = 'Over Limit';
      isWarning = true;
    } else if (usagePercentage > 80) {
      statusColor = 'text-warning bg-warning/10 border-warning/20';
      dotColor = 'bg-warning';
      statusText = 'Near Limit';
      isWarning = true;
    }

    return (
      <div className="border border-border rounded-xl p-2.5 bg-surface shadow-xs relative">
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
          title="Clear Customer (Reset to Walk-in)"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2 mb-1.5 pr-6">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-text-primary truncate">{selectedCustomer.name}</span>
          <div className={`px-2 py-0.2 rounded-full text-[9px] font-black border flex items-center gap-1 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {statusText}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-border/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Balance</span>
            <span className="font-black text-text-primary tabular-nums text-xs">
              Rs {currentBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Limit</span>
            <span className="font-bold text-text-secondary tabular-nums text-xs">
              Rs {creditLimit.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Available</span>
            <span className={`font-black tabular-nums text-xs ${isWarning ? 'text-danger' : 'text-success'}`}>
              Rs {availableCredit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="h-4 w-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-xl bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-all"
          placeholder="Search customer (Name, Phone, Khata)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setDropdownOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isDropdownOpen && searchTerm.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-surface border border-border rounded-xl shadow-modal max-h-60 overflow-y-auto custom-scrollbar p-1">
          {isLoading ? (
            <div className="p-3 text-xs text-text-muted text-center">Searching customers...</div>
          ) : searchResults.length > 0 ? (
            <ul className="space-y-0.5">
              {searchResults.map((customer, index) => (
                <li
                  key={customer.id}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-surface-hover text-text-primary'
                  }`}
                  onClick={() => handleSelect(customer)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{customer.name}</span>
                    <span className="text-[10px] text-text-muted">{customer.phone || customer.mobile || 'No phone'}</span>
                  </div>
                  <div className="text-xs font-black tabular-nums text-text-secondary shrink-0">
                    Rs {(customer.currentBalance || 0).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-xs text-text-muted text-center">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
