import React from 'react';
import { InvoiceDocument } from '../../services/document/document.service';

interface InvoiceTemplateProps {
  invoice: InvoiceDocument;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
  return (
    <div id="print-area" className="bg-white text-black p-4 w-[80mm] print:w-full print:p-0 mx-auto">
      
      <h1 className="text-center font-bold text-lg mb-1">
        {invoice.shop.name}
      </h1>

      <p className="text-center text-xs mb-3">
        {invoice.shop.address}
      </p>

      <hr className="border-black mb-2 border-dashed" />

      <p className="text-xs">
        <span className="font-semibold">Invoice:</span> {invoice.invoiceId}
      </p>

      <p className="text-xs mb-2">
        <span className="font-semibold">Date:</span> {new Date(invoice.createdAt).toLocaleString()}
      </p>

      <hr className="border-black my-2 border-dashed" />

      {/* Table Header */}
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="flex-1">Item</span>
        <span className="w-12 text-center">Qty</span>
        <span className="w-16 text-right">Total</span>
      </div>
      
      <hr className="border-black my-1" />

      {/* Items */}
      {invoice.items.map((item, i) => (
        <div key={i} className="flex justify-between text-xs my-1">
          <span className="flex-1 pr-2 truncate">{item.name}</span>
          <span className="w-12 text-center">x{item.qty}</span>
          <span className="w-16 text-right tabular-nums">{item.subtotal}</span>
        </div>
      ))}

      <hr className="border-black my-2 border-dashed" />

      {/* Summary */}
      <div className="flex justify-between text-sm mb-1">
        <span>Subtotal:</span>
        <span className="tabular-nums">{invoice.summary.subtotal}</span>
      </div>
      
      {invoice.summary.discountTotal > 0 && (
        <div className="flex justify-between text-sm mb-1">
          <span>Discount:</span>
          <span className="tabular-nums">-{invoice.summary.discountTotal}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-sm my-2">
        <span>Total:</span>
        <span className="tabular-nums">{invoice.summary.total}</span>
      </div>

      <hr className="border-black my-2 border-dashed" />

      <div className="flex justify-between text-xs mb-1">
        <span>Paid:</span>
        <span className="tabular-nums">{invoice.summary.paid}</span>
      </div>

      <div className="flex justify-between text-xs mb-1">
        <span>Change:</span>
        <span className="tabular-nums">{invoice.summary.change}</span>
      </div>

      <div className="flex justify-between text-xs">
        <span className="font-semibold">Due:</span>
        <span className="tabular-nums font-semibold">{invoice.summary.due}</span>
      </div>
      
      {invoice.paymentBreakdown.length > 0 && (
        <div className="mt-4 text-xs">
          <p className="font-semibold mb-1">Payment Methods:</p>
          {invoice.paymentBreakdown.map((p, i) => (
            <div key={i} className="flex justify-between">
              <span>{p.method}</span>
              <span className="tabular-nums">{p.amount}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-xs italic">
        Thank you for your business!
      </div>
      
    </div>
  );
};
