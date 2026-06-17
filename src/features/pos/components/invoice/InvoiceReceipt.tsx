'use client';

import React from 'react';
import { usePosStore } from '../../store/usePosStore';

export const InvoiceReceipt = () => {
  const invoice = usePosStore(state => state.lastInvoice);

  if (!invoice) return null;

  const { shop, summary, payment, meta, items, returnedItems } = invoice;

  // Smart Print Logic Formats
  const isReplace = meta.transactionType === 'replace_exchange';
  const isCredit = payment.method === 'credit';
  const isRefund = summary.total < 0;

  return (
    <>
      {/* 80mm Print Container */}
      <div className="print-area font-mono text-sm leading-tight text-black bg-white p-2 w-[80mm] mx-auto hidden print:block">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg uppercase">{shop.shopName}</h1>
          <p className="text-xs mt-1">{shop.address}</p>
          <p className="text-xs">Tel: {shop.phone1}{shop.phone2 ? ` | ${shop.phone2}` : ''}</p>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Meta */}
        <div className="text-xs space-y-1 mb-2">
          <p>Invoice: {invoice.invoiceNo}</p>
          <p>Date: {new Date(invoice.date).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>
          {payment.method && <p>Method: {payment.method.toUpperCase()}</p>}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Items */}
        <div className="mb-2">
          <p className="font-bold text-xs mb-1">Items:</p>
          
          {/* Returned Items */}
          {isReplace && returnedItems.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase italic">-- Returned --</p>
              {returnedItems.map((item, idx) => (
                <div key={`ret-${idx}`} className="text-xs flex justify-between mb-1">
                  <div className="w-[50%] truncate uppercase">[-] {item.productName}</div>
                  <div className="w-[15%] text-center">x{item.quantity}</div>
                  <div className="w-[35%] text-right tabular-nums">-{item.subtotal}</div>
                </div>
              ))}
            </div>
          )}

          {/* Purchased Items */}
          {items.length > 0 && (
            <div>
              {isReplace && <p className="text-[10px] font-bold uppercase italic">-- Purchased --</p>}
              {items.map((item, idx) => (
                <div key={`new-${idx}`} className="text-xs flex justify-between mb-1">
                  <div className="w-[50%] truncate uppercase">{item.productName}</div>
                  <div className="w-[15%] text-center">x{item.quantity}</div>
                  <div className="w-[35%] text-right tabular-nums">{item.subtotal}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Financial Breakdown */}
        <div className="text-xs space-y-1">
          {isReplace ? (
            <>
              <div className="flex justify-between">
                <span>New Items Subtotal:</span>
                <span className="tabular-nums">{summary.newItemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Returned Value:</span>
                <span className="tabular-nums">-{summary.returnTotal}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">{summary.newItemsTotal}</span>
            </div>
          )}
          
          {summary.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="tabular-nums">-{summary.discount}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold mt-1 text-sm border-t border-black pt-1">
            <span>{isRefund ? 'REFUND DUE:' : 'TOTAL:'}</span>
            <span className="tabular-nums">{Math.abs(summary.total)}</span>
          </div>

          {!isCredit && !isRefund && (
            <>
              <div className="flex justify-between mt-1">
                <span>Cash Received:</span>
                <span className="tabular-nums">{payment.cashReceived}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>CHANGE:</span>
                <span className="tabular-nums">{payment.change}</span>
              </div>
            </>
          )}

          {isCredit && (
            <div className="flex justify-between font-bold mt-1">
              <span>PAID TO LEDGER</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="font-bold text-xs">{shop.invoiceNote || 'THANK YOU FOR SHOPPING'}</p>
          <p className="text-[10px] mt-1">Powered by TijaratPro POS</p>
        </div>

      </div>

      {/* Embedded CSS for Print Override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
          }
        }
      `}} />
    </>
  );
};
