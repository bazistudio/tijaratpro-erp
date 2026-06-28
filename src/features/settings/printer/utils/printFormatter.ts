import { UnifiedInvoice, PrinterSettings, ShopHeader } from '../types/printer.types';

// Print Strategy Layer
export const printFormatter = {
  formatSaleInvoice: (order: any, settings: PrinterSettings, shop: ShopHeader): string => {
    const invoice: UnifiedInvoice = {
      invoiceNo: order.displayNumber || order.orderNumber,
      date: new Date(order.createdAt).toLocaleString(),
      customer: order.partyId 
        ? { name: order.partyId.companyName || order.partyId.contactPerson || 'Walk-in', phone: order.partyId.phone } 
        : (order.customerId ? { name: order.customerId.name || 'Walk-in', phone: order.customerId.phone } : undefined),
      items: order.items.map((i: any) => {
        const price = i.salePrice || i.price || 0;
        return { name: i.productName || i.name, qty: i.quantity, price, total: i.quantity * price };
      }),
      subtotal: order.subTotal || order.grandTotal || order.totalAmount || 0,
      discount: order.discount || 0,
      tax: order.taxAmount || 0,
      total: order.grandTotal || order.totalAmount || 0,
      paymentMethod: order.paymentMethod,
      shop
    };
    return renderDocument(invoice, settings, 'Sale Receipt');
  },

  formatPurchaseInvoice: (purchase: any, settings: PrinterSettings, shop: ShopHeader): string => {
    const invoice: UnifiedInvoice = {
      invoiceNo: purchase.invoiceNumber || purchase._id.slice(-6).toUpperCase(),
      date: new Date(purchase.issuedAt || purchase.createdAt).toLocaleString(),
      customer: purchase.supplierId ? { name: purchase.supplierId.name || 'Supplier' } : undefined,
      items: (purchase.items || []).map((i: any) => ({ name: i.name, qty: i.quantity, price: i.price, total: i.total || (i.quantity * i.price) })),
      subtotal: purchase.subtotal || purchase.grandTotal,
      discount: purchase.discount || 0,
      tax: purchase.tax || 0,
      total: purchase.grandTotal || purchase.totalAmount,
      paymentMethod: purchase.paymentMethod || 'cash',
      shop
    };
    return renderDocument(invoice, settings, 'Purchase Invoice');
  },

  formatExpenseVoucher: (expense: any, settings: PrinterSettings, shop: ShopHeader): string => {
    const invoice: UnifiedInvoice = {
      invoiceNo: expense._id.slice(-8).toUpperCase(),
      date: new Date(expense.date || expense.createdAt).toLocaleString(),
      customer: { name: 'Internal Expense' },
      items: [{ name: `${expense.title} (${expense.category})`, qty: 1, price: expense.amount, total: expense.amount }],
      subtotal: expense.amount,
      discount: 0,
      tax: 0,
      total: expense.amount,
      paymentMethod: expense.paymentMethod,
      shop
    };
    return renderDocument(invoice, settings, 'Expense Voucher');
  },

  formatPaymentReceipt: (ledger: any, settings: PrinterSettings, shop: ShopHeader): string => {
    const invoice: UnifiedInvoice = {
      invoiceNo: ledger.transactionId || (ledger.id ? ledger.id.slice(-8).toUpperCase() : ledger._id?.slice(-8).toUpperCase()),
      date: new Date(ledger.createdAt || ledger.timestamp).toLocaleString(),
      customer: { name: ledger.customerId?.name || ledger.supplierId?.name || 'Party' },
      items: [{ name: `Payment: ${ledger.description || ledger.type}`, qty: 1, price: ledger.amount, total: ledger.amount }],
      subtotal: ledger.amount,
      discount: 0,
      tax: 0,
      total: ledger.amount,
      paymentMethod: ledger.debitAccount,
      shop
    };
    return renderDocument(invoice, settings, 'Payment Receipt');
  },

  formatLedgerStatement: (party: any, timeline: any[], settings: PrinterSettings, shop: ShopHeader, filterTitle: string = 'Full Ledger'): string => {
    // We only support A4/PDF for ledger statements as thermal is too narrow
    const title = (party.type === 'CUSTOMER' ? 'Customer' : 'Supplier') + ' Ledger Statement';
    
    let html = '';
    html += '<div style="font-family: ' + settings.font.family + '; font-size: ' + settings.font.size + 'px; padding: 20px; max-width: 800px; margin: 0 auto; color: #000;">';
    html += '<div style="text-align: center; margin-bottom: 20px;">';
    
    if (settings.invoice.showLogo && shop.logoUrl) {
      html += '<img src="' + shop.logoUrl + '" style="max-height: 80px;" />';
    }
    
    if (settings.invoice.showShopInfo) {
      html += '<h1 style="margin: 5px 0;">' + shop.name + '</h1>';
      html += '<p style="margin: 2px 0;">' + shop.address + '</p>';
      html += '<p style="margin: 2px 0;">' + shop.phone + '</p>';
    }
    
    html += '<h2 style="margin: 10px 0; border: 1px solid #000; display: inline-block; padding: 5px 15px; border-radius: 4px;">' + title + '</h2>';
    html += '</div>';

    html += '<div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px;">';
    html += '<div>';
    html += '<p style="margin: 2px 0;"><strong>Party:</strong> ' + party.name + '</p>';
    html += '<p style="margin: 2px 0;"><strong>Type:</strong> ' + party.type + '</p>';
    html += '</div>';
    html += '<div style="text-align: right;">';
    html += '<p style="margin: 2px 0;"><strong>Filter:</strong> ' + filterTitle + '</p>';
    html += '<p style="margin: 2px 0;"><strong>Current Balance:</strong> ' + Math.abs(party.balance).toLocaleString() + (party.balance < 0 ? ' CR' : ' DR') + '</p>';
    html += '</div>';
    html += '</div>';

    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    html += '<thead>';
    html += '<tr style="border-bottom: 2px solid #000;">';
    html += '<th style="text-align: left; padding: 5px;">Date</th>';
    html += '<th style="text-align: left; padding: 5px;">Reference</th>';
    html += '<th style="text-align: left; padding: 5px;">Details</th>';
    html += '<th style="text-align: right; padding: 5px;">Debit</th>';
    html += '<th style="text-align: right; padding: 5px;">Credit</th>';
    html += '<th style="text-align: right; padding: 5px;">Balance</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    timeline.forEach(entry => {
      const isPayment = entry.type === 'payment';
      const isCustomer = party.type === 'CUSTOMER';
      const showDebit = isCustomer ? !isPayment : isPayment;
      const showCredit = isCustomer ? isPayment : !isPayment;
      const bal = entry.runningBalance || 0;

      let displayDesc = entry.description || '';
      if (displayDesc.toLowerCase().includes('credit')) displayDesc = 'Credit';
      else if (displayDesc.toLowerCase().includes('cash')) displayDesc = 'Cash';

      html += '<tr style="border-bottom: 1px solid #eee;">';
      html += '<td style="padding: 5px;">' + new Date(entry.timestamp).toLocaleDateString() + '</td>';
      html += '<td style="padding: 5px;">' + entry.transactionId + '</td>';
      html += '<td style="padding: 5px;">' + displayDesc + '</td>';
      html += '<td style="text-align: right; padding: 5px;">' + (showDebit ? entry.amount.toLocaleString() : '-') + '</td>';
      html += '<td style="text-align: right; padding: 5px;">' + (showCredit ? entry.amount.toLocaleString() : '-') + '</td>';
      html += '<td style="text-align: right; padding: 5px;">' + Math.abs(bal).toLocaleString() + (bal < 0 ? ' CR' : ' DR') + '</td>';
      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    html += '<div style="clear: both; margin-top: 50px; text-align: center;">';
    html += '<p>' + (shop.footerText || '') + '</p>';
    html += '</div>';
    html += '</div>';

    return html;
  },

  // Fallback for generic/mock preview
  format: (invoice: UnifiedInvoice, settings: PrinterSettings): string => {
    return renderDocument(invoice, settings, 'Receipt');
  }
};

const renderDocument = (invoice: UnifiedInvoice, settings: PrinterSettings, title: string): string => {
  switch (settings.printerType) {
    case 'A4':
    case 'PDF_ONLY':
      return formatA4(invoice, settings, title);
    case 'THERMAL_80MM':
      return formatThermal(invoice, settings, 80, title);
    case 'THERMAL_58MM':
      return formatThermal(invoice, settings, 58, title);
    default:
      return formatThermal(invoice, settings, 80, title);
  }
};

const formatA4 = (invoice: UnifiedInvoice, settings: PrinterSettings, title: string): string => {
  return `
    <div style="font-family: ${settings.font.family}; font-size: ${settings.font.size}px; padding: ${settings.layout.marginTop}px ${settings.layout.marginRight}px ${settings.layout.marginBottom}px ${settings.layout.marginLeft}px; max-width: 800px; margin: 0 auto; color: #000;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${settings.invoice.showLogo && invoice.shop.logoUrl ? `<img src="${invoice.shop.logoUrl}" style="max-height: 80px;" />` : ''}
        ${settings.invoice.showShopInfo ? `
          <h1 style="margin: 5px 0;">${invoice.shop.name}</h1>
          <p style="margin: 2px 0;">${invoice.shop.address}</p>
          <p style="margin: 2px 0;">${invoice.shop.phone}</p>
        ` : ''}
        <h2 style="margin: 10px 0; border: 1px solid #000; display: inline-block; padding: 5px 15px; border-radius: 4px;">${title}</h2>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px;">
        <div>
          <p style="margin: 2px 0;"><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
          <p style="margin: 2px 0;"><strong>Date:</strong> ${invoice.date}</p>
        </div>
        ${invoice.customer ? `
        <div style="text-align: right;">
          <p style="margin: 2px 0;"><strong>Party:</strong> ${invoice.customer.name}</p>
          ${invoice.customer.phone ? `<p style="margin: 2px 0;">${invoice.customer.phone}</p>` : ''}
        </div>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 5px;">Description</th>
            <th style="text-align: right; padding: 5px;">Qty</th>
            <th style="text-align: right; padding: 5px;">Rate</th>
            <th style="text-align: right; padding: 5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 5px;">${item.name}</td>
              <td style="text-align: right; padding: 5px;">${item.qty}</td>
              <td style="text-align: right; padding: 5px;">${item.price.toFixed(2)}</td>
              <td style="text-align: right; padding: 5px;">${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="width: 300px; float: right;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Subtotal:</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${settings.invoice.showDiscount && invoice.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Discount:</span>
          <span>-${invoice.discount.toFixed(2)}</span>
        </div>` : ''}
        ${settings.invoice.showTax && invoice.tax > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Tax:</span>
          <span>+${invoice.tax.toFixed(2)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; font-weight: bold; font-size: 1.2em;">
          <span>Total:</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="clear: both; margin-top: 50px; text-align: center;">
        <p>${invoice.shop.footerText || ''}</p>
      </div>
    </div>
  `;
};

const formatThermal = (invoice: UnifiedInvoice, settings: PrinterSettings, width: number, title: string): string => {
  const is58 = width === 58;
  const pxWidth = is58 ? 219 : 302;
  
  return `
    <div style="font-family: ${settings.font.family}; font-size: ${is58 ? settings.font.size - 2 : settings.font.size}px; width: ${pxWidth}px; margin: 0 auto; line-height: 1.2; color: #000;">
      <div style="text-align: center; margin-bottom: 10px;">
        ${!is58 && settings.invoice.showLogo && invoice.shop.logoUrl ? `<img src="${invoice.shop.logoUrl}" style="max-width: 80%; max-height: 80px; margin-bottom: 5px;" />` : ''}
        ${settings.invoice.showShopInfo ? `
          <div style="font-weight: bold; font-size: ${is58 ? '1.1em' : '1.2em'};">${invoice.shop.name}</div>
          ${!is58 ? `<div>${invoice.shop.address}</div>` : ''}
          <div>${invoice.shop.phone}</div>
        ` : ''}
        <div style="margin-top: 3px; font-weight: bold;">*** ${title.toUpperCase()} ***</div>
      </div>
      
      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin-bottom: 5px; font-size: 0.9em;">
        <div>Inv: ${invoice.invoiceNo}</div>
        <div>Date: ${invoice.date}</div>
        ${invoice.customer ? `<div>Cust: ${invoice.customer.name}</div>` : ''}
      </div>

      <table style="width: 100%; text-align: left; margin-bottom: 5px; font-size: 0.95em;">
        <tr style="border-bottom: 1px dashed #000;">
          <th style="padding-bottom: 2px;">Item</th>
          <th style="text-align: right; padding-bottom: 2px;">Amount</th>
        </tr>
        ${invoice.items.map(item => `
          <tr>
            <td colspan="2" style="padding-top: 3px; word-break: break-word;">${item.name}</td>
          </tr>
          <tr>
            <td style="color: #444;">${item.qty} x ${item.price}</td>
            <td style="text-align: right;">${item.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      
      <div style="border-top: 1px dashed #000; padding-top: 5px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${settings.invoice.showDiscount && invoice.discount > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Discount</span>
          <span>-${invoice.discount.toFixed(2)}</span>
        </div>` : ''}
        ${settings.invoice.showTax && invoice.tax > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Tax</span>
          <span>+${invoice.tax.toFixed(2)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; border-top: 1px solid #000; margin-top: 3px; padding-top: 3px;">
          <span>Total</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 15px; font-size: 0.9em;">
        <div>${invoice.shop.footerText || ''}</div>
      </div>
    </div>
  `;
};
