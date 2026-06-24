import React, { useEffect } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { usePrintStore } from '@/lib/printer';
import { usePrinterStore } from '@/features/settings/printer/store/printer.store';
import { printFormatter } from '@/features/settings/printer/utils/printFormatter';
import { UnifiedInvoice } from '@/features/settings/printer/types/printer.types';

export const InvoiceReceipt = () => {
  const invoice = usePosStore(state => state.lastInvoice);
  const setLastInvoice = usePosStore(state => state.setLastInvoice);
  
  const { openPreview } = usePrintStore();
  const { settings, shopHeader } = usePrinterStore();

  useEffect(() => {
    if (invoice && settings && shopHeader) {
      const unified: UnifiedInvoice = {
        invoiceNo: invoice.invoiceId,
        date: new Date(invoice.createdAt).toLocaleString(),
        customer: undefined, // Or populate if available
        items: invoice.items.map(i => ({ name: i.name, qty: i.qty, price: i.price, total: i.subtotal })),
        subtotal: invoice.summary.subtotal,
        discount: invoice.summary.discountTotal,
        tax: 0,
        total: invoice.summary.total,
        paymentMethod: invoice.paymentBreakdown?.[0]?.method || 'cash',
        shop: shopHeader
      };

      const html = printFormatter.format(unified, settings);
      openPreview({ 
        html, 
        documentType: 'SaleInvoice', 
        referenceId: invoice.transactionId, 
        title: `Sale Receipt - ${invoice.invoiceId}` 
      });
      
      setLastInvoice(null);
    }
  }, [invoice, settings, shopHeader, openPreview, setLastInvoice]);

  return null;
};
