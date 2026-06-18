'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { usePosStore } from '../store/usePosStore';
import { useInventoryStore } from '@/features/inventory/core/inventory.store';

export const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  const activeSession = usePosStore(state => state.getActiveSession());
  const addToCart = usePosStore(state => state.addToCart);
  const { products, fetchProducts } = useInventoryStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const isReplaceMode = activeSession?.mode === 'replace';
  const [targetBucket, setTargetBucket] = useState<'new' | 'return'>('new');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-switch back to 'new' if replace mode is turned off
  useEffect(() => {
    if (!isReplaceMode) setTargetBucket('new');
  }, [isReplaceMode]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Search logic
  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setResults([]);
      return;
    }
    
    const lowerTerm = debouncedTerm.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(lowerTerm) || 
      p.sku.toLowerCase().includes(lowerTerm) || 
      (p.barcode || '').includes(lowerTerm)
    ).slice(0, 20); // Cap at 20 results for performance
    
    setResults(filtered);
  }, [debouncedTerm]);

  // Keyboard shortcut for focusing search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Auto-add on exact barcode or SKU match
      const exactMatch = products.find(p => 
        p.barcode === searchTerm.trim() || p.sku.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      
      if (exactMatch) {
        handleAdd(exactMatch);
      }
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
    // Auto focus back to input for rapid scanning
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="relative shrink-0 flex flex-col gap-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Product by name / barcode / SKU .........."
            className={`block w-full pl-10 pr-3 py-3 border-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium shadow-sm transition-colors ${
              targetBucket === 'return' ? 'border-orange-400 focus:border-orange-500' : 'border-gray-200 dark:border-gray-700 focus:border-[#006970]'
            }`}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Shortcuts:</span>
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-sans">/</kbd> Focus</span>
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-sans">F2</kbd> Customer</span>
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-sans">ESC</kbd> Clear</span>
          </div>

          {isReplaceMode && (
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setTargetBucket('return')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${targetBucket === 'return' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <ArrowDownToLine className="h-3 w-3" />
                RETURN ITEM
              </button>
              <button
                onClick={() => setTargetBucket('new')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${targetBucket === 'new' ? 'bg-[#006970] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <ArrowUpFromLine className="h-3 w-3" />
                NEW ITEM
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
          <div className="col-span-2">SKU</div>
          <div className="col-span-6">Product</div>
          <div className="col-span-1 text-center">Stock</div>
          <div className="col-span-2 text-right">Sale Rate</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {results.length > 0 ? (
            results.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleAdd(product)}
                className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 items-center transition-colors group cursor-pointer ${product.stock > 0 || targetBucket === 'return' ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/20'}`}
              >
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 font-mono">{product.sku}</div>
                <div className="col-span-6 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</div>
                <div className={`col-span-1 text-sm text-center font-bold ${(product.stock > 0 || targetBucket === 'return') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.stock}
                </div>
                <div className="col-span-2 text-sm font-bold text-right text-gray-900 dark:text-gray-100 tabular-nums">
                  Rs {(product.price ?? product.salePrice ?? 0).toLocaleString()}
                </div>
                <div className="col-span-1 text-right">
                  <button 
                    disabled={targetBucket === 'new' && product.stock < 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(product);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:group-hover:bg-gray-100 disabled:group-hover:text-gray-600 ${
                      targetBucket === 'return' 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white dark:bg-orange-900/30 dark:text-orange-400' 
                        : 'bg-gray-100 text-gray-600 hover:bg-[#006970] hover:text-white dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    ADD
                  </button>
                </div>
              </div>
            ))
          ) : debouncedTerm.trim() ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No products found for "{debouncedTerm}"
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Type to search for products... (Try "A123" or "iPhone")
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
