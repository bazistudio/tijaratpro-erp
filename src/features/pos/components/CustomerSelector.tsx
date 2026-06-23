"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCircle2, AlertTriangle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/services/customer.api';
import { DBCustomer } from '@/types/db.types';

interface CustomerSelectorProps {
  onSelectCustomer: (customer: DBCustomer | null) => void;
  selectedCustomer: DBCustomer | null;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({ onSelectCustomer, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ['customers', 'search', searchTerm],
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
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
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
    
    let statusColor = 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    let dotColor = 'bg-green-500';
    let statusText = 'Safe';
    let isWarning = false;

    if (usagePercentage > 100) {
      statusColor = 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      dotColor = 'bg-red-500';
      statusText = 'Over Limit';
      isWarning = true;
    } else if (usagePercentage > 80) {
      statusColor = 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      dotColor = 'bg-orange-500';
      statusText = 'Near Limit';
      isWarning = true;
    }

    return (
      <div className="mb-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 shadow-sm relative">
        <button 
          onClick={handleClear}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <UserCircle2 className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</span>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {statusText}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-500">Balance</span>
            <span className="font-semibold text-gray-900 dark:text-white">Rs {currentBalance.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Limit</span>
            <span className="font-semibold text-gray-900 dark:text-white">Rs {creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Available</span>
            <span className={`font-semibold ${isWarning ? 'text-red-500' : 'text-green-600'}`}>
              Rs {availableCredit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#006970] focus:border-transparent sm:text-sm transition-colors"
          placeholder="Search customer for sale..."
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
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="py-1">
              {searchResults.map((customer, index) => (
                <li 
                  key={customer.id}
                  className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent'
                  }`}
                  onClick={() => handleSelect(customer)}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${index === selectedIndex ? 'text-blue-700 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                      {customer.name}
                    </span>
                    <span className="text-xs text-gray-500">{customer.phone}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#006970]">
                    Rs {customer.currentBalance.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
};
