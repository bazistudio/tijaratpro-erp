'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText } from 'lucide-react';
import { usePosStore } from '../store/usePosStore';
import { salesApi } from '@/services/sales.api';

export const InvoiceSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadInvoice = usePosStore(state => state.loadInvoice);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Search logic
  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }
    
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await salesApi.getOrders({ orderNumber: debouncedTerm.trim(), limit: 10 });
        if (response.success && response.data) {
          setResults(response.data);
          setSelectedIndex(0);
          setIsDropdownOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [debouncedTerm]);

  // Scroll to selected item
  useEffect(() => {
    if (isDropdownOpen && resultsListRef.current) {
      const selectedEl = resultsListRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        const container = resultsListRef.current;
        if (selectedEl.offsetTop < container.scrollTop) {
          container.scrollTop = selectedEl.offsetTop;
        } else if (selectedEl.offsetTop + selectedEl.offsetHeight > container.scrollTop + container.offsetHeight) {
          container.scrollTop = selectedEl.offsetTop + selectedEl.offsetHeight - container.offsetHeight;
        }
      }
    }
  }, [selectedIndex, isDropdownOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDropdownOpen && results.length > 0) setIsDropdownOpen(true);
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isDropdownOpen && results.length > 0) {
        handleAdd(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleAdd = (invoice: any) => {
    loadInvoice(invoice);
    setSearchTerm('');
    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative z-50 flex flex-col gap-2 w-full max-w-xs xl:max-w-sm" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isDropdownOpen) setIsDropdownOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search Invoice No."
          className="block w-full pl-10 pr-3 py-3 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium shadow-sm transition-colors border-gray-200 dark:border-gray-700 focus:border-[#006970]"
        />
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && debouncedTerm.trim() && (
        <div className="absolute top-[52px] left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col max-h-[60vh]">
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 ml-2">
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">↓↑</kbd> Navigate</span>
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">↵</kbd> Select</span>
            </div>
            {isLoading && <span className="text-xs text-[#006970] animate-pulse font-medium mr-2">Searching...</span>}
          </div>
          
          {results.length > 0 ? (
            <div className="overflow-y-auto no-scrollbar" ref={resultsListRef}>
              {results.map((invoice, index) => {
                const isSelected = index === selectedIndex;
                const date = new Date(invoice.createdAt || Date.now()).toLocaleDateString();
                return (
                  <div 
                    key={invoice._id || invoice.orderNumber} 
                    onClick={() => handleAdd(invoice)}
                    className={`flex items-center justify-between px-4 py-3 border-b transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#006970]/10 dark:bg-[#00B4BB]/20 border-[#006970] dark:border-[#00B4BB] border-l-4 border-r-0 border-y-0 shadow-inner' 
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`h-5 w-5 ${isSelected ? 'text-[#006970]' : 'text-gray-400'}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {invoice.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {invoice.customer?.name || 'Walk-in'} • {date}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-right text-[#006970] dark:text-[#00B4BB] tabular-nums">
                      Rs {(invoice.totalAmount || invoice.grandTotal || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No invoice found for "{debouncedTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
