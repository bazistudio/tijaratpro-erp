'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowDownToLine } from 'lucide-react';
import { usePosStore, useCartTotals } from '../store/usePosStore';
import { CartItem } from '../store/usePosStore';

export const CartTable = () => {
  const activeSession = usePosStore(state => state.getActiveSession());
  const updateQuantity = usePosStore(state => state.updateQuantity);
  const removeFromCart = usePosStore(state => state.removeFromCart);
  const setItemDiscount = usePosStore(state => state.setItemDiscount);
  
  const { totalItems, totalQuantity, returnItemsCount, returnQuantity } = useCartTotals();

  // Local state for quantity input to allow empty string during typing
  const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

  if (!activeSession) return null;
  const cart = activeSession?.cart ?? [];
  const returnedItems = activeSession?.returnedItems ?? [];
  const mode = activeSession?.mode;

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

  const renderItemRow = (item: CartItem, isReturn: boolean) => {
    const key = `${isReturn ? 'ret' : 'new'}-${item.productId}`;
    const inputValue = localQuantities[key] !== undefined ? localQuantities[key] : item.quantity;
    
    return (
      <div key={key} className={`grid grid-cols-12 gap-2 px-3 py-3 border-b items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${isReturn ? 'border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
        <div className="col-span-4 overflow-hidden">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-2" title={item.productName}>
            {isReturn && <ArrowDownToLine className="h-3 w-3 text-orange-500 shrink-0" />}
            <span className={isReturn ? 'text-orange-900 dark:text-orange-100' : ''}>{item.productName}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums flex items-center gap-2">
            <span>Rs {item.unitPrice.toLocaleString()}</span>
            {!isReturn && item.maxStock <= 3 && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                🔥 Only {item.maxStock} left
              </span>
            )}
          </p>
        </div>
        <div className="col-span-2 flex items-center justify-center gap-1">
          <button 
            onClick={() => updateQuantity(item.productId, item.quantity - 1, isReturn)}
            disabled={item.quantity <= 1}
            className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input 
            type="number"
            value={inputValue}
            onChange={(e) => handleQtyChange(item.productId, e.target.value, item.maxStock, isReturn)}
            onBlur={() => handleQtyBlur(item.productId, item.quantity, isReturn)}
            className="text-sm font-bold w-10 text-center tabular-nums bg-transparent focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded no-spinners"
            min="1"
            max={isReturn ? undefined : item.maxStock}
          />
          <button 
            onClick={() => updateQuantity(item.productId, item.quantity + 1, isReturn)}
            disabled={!isReturn && item.quantity >= item.maxStock}
            className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        
        {/* Discount Controls */}
        <div className="col-span-3 flex flex-col items-center justify-center gap-1">
          {!isReturn ? (
            <div className="flex border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
              <input 
                type="number"
                value={item.discountValue || ''}
                placeholder="0"
                onChange={(e) => setItemDiscount(item.productId, item.discountType, parseFloat(e.target.value) || 0, isReturn)}
                className="w-12 text-xs font-semibold text-center py-1 bg-white dark:bg-gray-900 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 no-spinners"
              />
              <button 
                onClick={() => setItemDiscount(item.productId, item.discountType === 'percentage' ? 'fixed' : 'percentage', item.discountValue, isReturn)}
                className="px-1.5 py-1 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {item.discountType === 'percentage' ? '%' : 'Rs'}
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          {item.discount > 0 && <span className="text-[10px] text-red-500 font-bold tabular-nums">-Rs {item.discount.toLocaleString()}</span>}
        </div>

        <div className={`col-span-2 text-right text-sm font-bold tabular-nums ${isReturn ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {isReturn ? '-' : ''}{(item.subtotal).toLocaleString()}
        </div>
        <div className="col-span-1 text-right">
          <button 
            onClick={() => removeFromCart(item.productId, isReturn)}
            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        <div className="col-span-4">Product</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-3 text-center">Discount</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {cart.length === 0 && returnedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Cart is empty
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Returned Items Section */}
            {mode === 'replace' && returnedItems.length > 0 && (
              <div className="border-b-4 border-gray-100 dark:border-gray-800">
                <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/50 text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownToLine className="h-3 w-3" />
                  Items Returned by Customer
                </div>
                {returnedItems.map(item => renderItemRow(item, true))}
              </div>
            )}
            
            {/* New Items Section */}
            {cart.length > 0 && (
              <div>
                {mode === 'replace' && returnedItems.length > 0 && (
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    New Items Purchased
                  </div>
                )}
                {cart.map(item => renderItemRow(item, false))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {(cart.length > 0 || returnedItems.length > 0) && (
        <div className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider shrink-0">
          <div className="col-span-5 text-left flex gap-3">
            <span>Lines: <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">{totalItems}</span></span>
            {returnItemsCount > 0 && (
              <span className="text-orange-600">Ret: <span className="font-bold tabular-nums">{returnItemsCount}</span></span>
            )}
          </div>
          <div className="col-span-3 text-center flex gap-3 justify-center">
            <span>Qty: <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">{totalQuantity}</span></span>
            {returnQuantity > 0 && (
              <span className="text-orange-600">Ret: <span className="font-bold tabular-nums">{returnQuantity}</span></span>
            )}
          </div>
          <div className="col-span-4"></div>
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
