'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { usePosStore } from '../store/usePosStore';
import { useInventoryStore } from '@/features/inventory/core/inventory.store';

export const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const activeSession = usePosStore(state => state.getActiveSession());
  const addToCart = usePosStore(state => state.addToCart);
  const { products, fetchProducts } = useInventoryStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const isReplaceMode = activeSession?.mode === 'replace';
  const [targetBucket, setTargetBucket] = useState<'new' | 'return'>('new');
  
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

  // Auto-switch back to 'new' if replace mode is turned off
  useEffect(() => {
    if (!isReplaceMode) setTargetBucket('new');
  }, [isReplaceMode]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Search logic
  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }
    
    const lowerTerm = debouncedTerm.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(lowerTerm) || 
      p.sku.toLowerCase().includes(lowerTerm) || 
      (p.barcode || '').includes(lowerTerm)
    ).slice(0, 20); // Cap at 20 results
    
    setResults(filtered);
    setSelectedIndex(0);
    setIsDropdownOpen(true);
  }, [debouncedTerm, products]);

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

  // Keyboard shortcut for focusing search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
        setIsDropdownOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
      
      // If dropdown is open and we have results matching the debounce, select it
      if (isDropdownOpen && results.length > 0) {
        const product = results[selectedIndex];
        if (product && (product.stock > 0 || targetBucket === 'return')) {
          handleAdd(product);
          return;
        }
      }
      
      // Fallback: If they hit enter before debounce or for exact matches
      const searchTarget = searchTerm.trim().toLowerCase();
      if (!searchTarget) return;

      const exactMatch = products.find(p => 
        (p.barcode || '').toLowerCase() === searchTarget || 
        (p.sku || '').toLowerCase() === searchTarget ||
        p.name.toLowerCase() === searchTarget
      );
      
      if (exactMatch && (exactMatch.stock > 0 || targetBucket === 'return')) {
        handleAdd(exactMatch);
      } else if (results.length > 0) {
        // Just grab the first result if it exists as a fallback
        const product = results[0];
        if (product && (product.stock > 0 || targetBucket === 'return')) {
          handleAdd(product);
        }
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleAdd = (product: any) => {
    const dbProduct = {
      id: product.id,
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      costPrice: product.purchasePrice ?? product.costPrice ?? 0,
      salePrice: product.price ?? product.salePrice ?? 0,
      stock: product.stock,
      reservedStock: 0,
      lastUpdated: Date.now()
    };
    addToCart(dbProduct, targetBucket === 'return');
    setSearchTerm('');
    setIsDropdownOpen(false);
    // Auto focus back to input for rapid scanning
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative z-50 flex flex-col gap-2 w-full" ref={containerRef}>
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
          placeholder="Search Product by name / barcode / SKU .........."
          className={`block w-full pl-10 pr-3 py-3 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium shadow-sm transition-colors ${
            targetBucket === 'return' ? 'border-orange-400 focus:border-orange-500' : 'border-gray-200 dark:border-gray-700 focus:border-[#006970]'
          }`}
        />
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && debouncedTerm.trim() && (
        <div className="absolute top-[52px] left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col max-h-[60vh]">
          
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 ml-2">
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">↓↑</kbd> Navigate</span>
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">↵</kbd> Select</span>
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">ESC</kbd> Close</span>
            </div>

            {isReplaceMode && (
              <div className="flex bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
                <button
                  onClick={() => setTargetBucket('return')}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md transition-all ${targetBucket === 'return' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  RETURN
                </button>
                <button
                  onClick={() => setTargetBucket('new')}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md transition-all ${targetBucket === 'new' ? 'bg-[#006970] text-white shadow-sm' : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  <ArrowUpFromLine className="h-3 w-3" />
                  NEW
                </button>
              </div>
            )}
          </div>
          {results.length > 0 ? (
            <div className="overflow-y-auto no-scrollbar" ref={resultsListRef}>
              {results.map((product, index) => {
                const isSelected = index === selectedIndex;
                const canAdd = product.stock > 0 || targetBucket === 'return';
                return (
                  <div 
                    key={product.id} 
                    onClick={() => {
                      if (canAdd) handleAdd(product);
                    }}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 border-b items-center transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#006970]/10 dark:bg-[#00B4BB]/20 border-[#006970] dark:border-[#00B4BB] border-l-4 border-r-0 border-y-0 shadow-inner' 
                        : 'border-gray-100 dark:border-gray-800'
                    } ${canAdd ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 font-mono">{product.sku}</div>
                    <div className="col-span-6 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</div>
                    <div className={`col-span-1 text-sm text-center font-bold ${canAdd ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {product.stock}
                    </div>
                    <div className="col-span-2 text-sm font-bold text-right text-gray-900 dark:text-gray-100 tabular-nums">
                      Rs {(product.price ?? product.salePrice ?? 0).toLocaleString()}
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        disabled={!canAdd}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(product);
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:bg-transparent disabled:text-gray-400 ${
                          targetBucket === 'return' 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white dark:bg-orange-900/30 dark:text-orange-400' 
                            : 'bg-gray-100 text-gray-600 hover:bg-[#006970] hover:text-white dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No products found for "{debouncedTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
