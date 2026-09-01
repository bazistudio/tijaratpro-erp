'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CategoryFilterBar } from './CategoryFilterBar';
import { ProductCardGrid } from './ProductCardGrid';
import { CartTable } from './CartTable';
import { CartSummary } from './CartSummary';
import { PosExtraActions } from './PosExtraActions';
import { useInventoryStore } from '@/features/inventory/core/inventory.store';
import { usePosStore } from '../store/usePosStore';
import { DBInventory } from '@/types/db.types';
import { LayoutGrid, Layers, Zap, ShoppingCart, ScanBarcode } from 'lucide-react';
import toast from 'react-hot-toast';

export const SaleWorkspace: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'catalog' | 'actions'>('catalog');

  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  const addToCart = usePosStore((s) => s.addToCart);
  const activeSession = usePosStore((s) => s.getActiveSession());
  const isReturnMode = activeSession?.mode === 'replace';

  // Ensure products are loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  // ──────────────────────────────────────────────────────────────────────────
  // Hardware Barcode Scanner Buffer Implementation
  // ──────────────────────────────────────────────────────────────────────────
  const barcodeBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  const handleScanComplete = useCallback(
    (scannedCode: string) => {
      const trimmed = scannedCode.trim();
      if (!trimmed || trimmed.length < 2) return;

      const matchedProduct = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === trimmed.toLowerCase())
      );

      if (matchedProduct) {
        const isOutOfStock = (matchedProduct.stock || 0) <= 0;
        if (!isReturnMode && isOutOfStock) {
          toast.error(`Out of stock: ${matchedProduct.name}`);
          return;
        }

        const dbProduct: DBInventory = {
          id: matchedProduct.id || (matchedProduct as any)._id,
          sku: matchedProduct.sku || '',
          barcode: matchedProduct.barcode || '',
          name: matchedProduct.name,
          costPrice: matchedProduct.purchasePrice ?? (matchedProduct as any).costPrice ?? 0,
          salePrice: matchedProduct.price ?? (matchedProduct as any).salePrice ?? 0,
          stock: matchedProduct.stock ?? 0,
          reservedStock: 0,
          lastUpdated: Date.now(),
        };

        addToCart(dbProduct, isReturnMode);
        toast.success(`Scanned: ${matchedProduct.name}`, {
          icon: '🏷️',
          duration: 2000,
        });
      } else {
        toast.error(`Barcode not found: ${trimmed}`, {
          duration: 3000,
        });
      }
    },
    [products, isReturnMode, addToCart]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Skip if the user is typing in an input, textarea, or contentEditable element
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // Reset buffer if keystrokes are spaced out (normal human typing outside input)
      if (timeDiff > 250) {
        barcodeBuffer.current = '';
      }

      // Scanner terminator (Enter or Tab)
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (barcodeBuffer.current.length >= 2) {
          e.preventDefault();
          const scanned = barcodeBuffer.current;
          barcodeBuffer.current = '';
          handleScanComplete(scanned);
        }
        return;
      }

      // Buffer printable characters
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScanComplete]);

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden p-2 sm:p-3 gap-2">
      {/* Top Controls: Left View Switcher & Category Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 shrink-0">
        {/* View Mode Toggle: Catalog Grid vs Quick Actions */}
        <div className="flex items-center bg-surface border border-border rounded-xl p-1 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveLeftTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLeftTab === 'catalog'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Product Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLeftTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLeftTab === 'actions'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>POS Actions</span>
          </button>
        </div>

        {/* Category Pill Filters (Visible when in catalog mode) */}
        {activeLeftTab === 'catalog' && (
          <div className="flex-1 min-w-0">
            <CategoryFilterBar
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        )}
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* Left Side: Product Grid or Extra Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-sm">
          {activeLeftTab === 'catalog' ? (
            <ProductCardGrid
              selectedCategoryId={selectedCategoryId}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <PosExtraActions />
            </div>
          )}
        </div>

        {/* Right Side: Cart Table & Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Cart Table */}
          <div className="flex-[3] min-h-0 overflow-hidden">
            <CartTable />
          </div>

          {/* Cart Summary & Customer / Totals */}
          <div className="flex-[2] min-h-0 overflow-hidden">
            <CartSummary />
          </div>
        </div>
      </div>

      {/* POS Bottom Action Bar Portal Container */}
      <div id="pos-action-bar-portal" className="w-full shrink-0 z-10" />
    </main>
  );
};

export default SaleWorkspace;