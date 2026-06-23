'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowDownToLine } from 'lucide-react';
import { usePosStore } from '../store/usePosStore';
import { CartItem } from '../store/usePosStore';

export const CartTable = () => {
  const activeSession = usePosStore(state => state.getActiveSession());
  const updateQuantity = usePosStore(state => state.updateQuantity);
  const removeFromCart = usePosStore(state => state.removeFromCart);
  
  // Local state for quantity input to allow empty string during typing
  const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

  if (!activeSession) return null;
  const cart = activeSession?.cart ?? [];
  const returnedItems = activeSession?.returnedItems ?? [];
  const mode = activeSession?.mode;

  // Local render-time calculations (display previews only, not mutating business state)
  const totalItems = cart.length;
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const returnItemsCount = returnedItems.length;
  const returnQuantity = returnedItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleQtyChange = (productId: string, value: string, maxStock: number, isReturn: boolean) => {
    setLocalQuantities(prev => ({ ...prev, [`${isReturn ? 'ret' : 'new'}-${productId}`]: value }));
    
    if (value === '') return;
    
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (!isReturn && parsed > maxStock) {
        import('react-hot-toast').then(m => m.default.error(`Only ${maxStock} items in stock`));
        return;
      }
      updateQuantity(productId, parsed, isReturn);
    }
  };

  const handleQtyBlur = (productId: string, currentQty: number, isReturn: boolean) => {
    setLocalQuantities(prev => {
      const next = { ...prev };
      delete next[`${isReturn ? 'ret' : 'new'}-${productId}`];
      return next;
    });
  };

  const renderItemRow = (item: CartItem, isReturn: boolean, index: number) => {
    const key = `${isReturn ? 'ret' : 'new'}-${item.productId}`;
    const inputValue = localQuantities[key] !== undefined ? localQuantities[key] : item.quantity;
    
    return (
      <div key={key} className={`flex items-center px-2 py-0.5 border-b last:border-b-0 transition-colors group ${isReturn ? 'border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
        
        {/* S.No */}
        <div className="w-10 text-xs font-bold text-gray-400">
          {index + 1}
        </div>

        {/* Product Name */}
        <div className="flex-1 min-w-[120px] pr-2">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5" title={item.productName}>
            {isReturn && <ArrowDownToLine className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
            <span className={isReturn ? 'text-orange-900 dark:text-orange-100' : ''}>{item.productName}</span>
          </p>
        </div>

        {/* Stock Qty */}
        <div className="w-16 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          {!isReturn && item.maxStock <= 3 ? (
            <span className="text-red-500 font-bold">{item.maxStock}</span>
          ) : (
            item.maxStock
          )}
        </div>

        {/* Sale Price */}
        <div className="w-24 text-right text-sm font-black text-[#006970] dark:text-[#00B4BB] tabular-nums">
          {item.unitPrice.toLocaleString()}
        </div>

        {/* Sale Qty Controls */}
        <div className="w-32 flex justify-center px-2">
          <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800 p-0.5 rounded-md border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => updateQuantity(item.productId, item.quantity - 1, isReturn)}
              disabled={item.quantity <= 1}
              className="p-1 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-white shadow-sm"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input 
              type="number"
              value={inputValue}
              onChange={(e) => handleQtyChange(item.productId, e.target.value, item.maxStock, isReturn)}
              onBlur={() => handleQtyBlur(item.productId, item.quantity, isReturn)}
              className="text-sm font-black w-8 text-center tabular-nums bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded no-spinners"
              min="1"
              max={isReturn ? undefined : item.maxStock}
            />
            <button 
              onClick={() => updateQuantity(item.productId, item.quantity + 1, isReturn)}
              disabled={!isReturn && item.quantity >= item.maxStock}
              className="p-1 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Delete Icon */}
        <div className="w-12 flex justify-center">
          <button 
            onClick={() => removeFromCart(item.productId, isReturn)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Remove Item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
      
      {/* Classic Table Header */}
      <div className="flex items-center px-2 py-1 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest shrink-0">
        <div className="w-10">S.No</div>
        <div className="flex-1 min-w-[120px]">Product Name</div>
        <div className="w-16 text-center">Stock</div>
        <div className="w-24 text-right">Sale Price</div>
        <div className="w-32 text-center">Qty</div>
        <div className="w-12 text-center">Act</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        {cart.length === 0 && returnedItems.length === 0 ? null : (
          <div className="flex flex-col">
            {/* Returned Items Section */}
            {mode === 'replace' && returnedItems.length > 0 && (
              <div className="mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Items Returned by Customer
                </div>
                {returnedItems.map((item, idx) => renderItemRow(item, true, idx))}
              </div>
            )}
            
            {/* New Items Section */}
            {cart.length > 0 && (
              <div>
                {mode === 'replace' && returnedItems.length > 0 && (
                  <div className="px-4 py-2 bg-[#006970]/5 dark:bg-[#00B4BB]/10 text-xs font-black text-[#006970] dark:text-[#00B4BB] uppercase tracking-widest">
                    New Items Purchased
                  </div>
                )}
                {cart.map((item, idx) => renderItemRow(item, false, idx))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {(cart.length > 0 || returnedItems.length > 0) && (
        <div className="flex items-center justify-between px-4 py-3 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Lines</span>
              <span className="text-sm font-black text-gray-900 dark:text-gray-100 tabular-nums">{totalItems}</span>
            </div>
            {returnItemsCount > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Return Lines</span>
                <span className="text-sm font-black text-orange-600 tabular-nums">{returnItemsCount}</span>
              </div>
            )}
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Qty</span>
              <span className="text-sm font-black text-gray-900 dark:text-gray-100 tabular-nums">{totalQuantity}</span>
            </div>
            {returnQuantity > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Return Qty</span>
                <span className="text-sm font-black text-orange-600 tabular-nums">{returnQuantity}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-spinners::-webkit-inner-spin-button, 
        .no-spinners::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinners {
          -moz-appearance: textfield;
        }
      `}} />
    </div>
  );
};
