import { UnifiedInvoice, PrinterSettings } from '../types/printer.types';

// Print Strategy Layer
export const printFormatter = {
  format: (invoice: UnifiedInvoice, settings: PrinterSettings): string => {
    switch (settings.printerType) {
      case 'A4':
        return formatA4(invoice, settings);
      case 'THERMAL_80MM':
        return formatThermal(invoice, settings, 80);
      case 'THERMAL_58MM':
        return formatThermal(invoice, settings, 58);
      case 'PDF_ONLY':
        return formatA4(invoice, settings); // Fallback to A4 for PDF
      default:
        return formatThermal(invoice, settings, 80);
    }
  }
};

const formatA4 = (invoice: UnifiedInvoice, settings: PrinterSettings): string => {
  return `
    <div style="font-family: ${settings.font.family}; font-size: ${settings.font.size}px; padding: ${settings.layout.marginTop}px ${settings.layout.marginRight}px ${settings.layout.marginBottom}px ${settings.layout.marginLeft}px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${settings.invoice.showLogo && invoice.shop.logoUrl ? `<img src="${invoice.shop.logoUrl}" style="max-height: 80px;" />` : ''}
        ${settings.invoice.showShopInfo ? `
          <h1 style="margin: 5px 0;">${invoice.shop.name}</h1>
          <p style="margin: 2px 0;">${invoice.shop.address}</p>
          <p style="margin: 2px 0;">${invoice.shop.phone}</p>
        ` : ''}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px;">
        <div>
          <p style="margin: 2px 0;"><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
          <p style="margin: 2px 0;"><strong>Date:</strong> ${invoice.date}</p>
        </div>
        ${invoice.customer ? `
        <div style="text-align: right;">
          <p style="margin: 2px 0;"><strong>Customer:</strong> ${invoice.customer.name}</p>
          ${invoice.customer.phone ? `<p style="margin: 2px 0;">${invoice.customer.phone}</p>` : ''}
        </div>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 5px;">Item</th>
            <th style="text-align: right; padding: 5px;">Qty</th>
            <th style="text-align: right; padding: 5px;">Price</th>
            <th style="text-align: right; padding: 5px;">Total</th>
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
        ${settings.invoice.showBarcode ? `<div style="margin-top: 20px;">[BARCODE MOCK: ${invoice.invoiceNo}]</div>` : ''}
      </div>
    </div>
  `;
};

const formatThermal = (invoice: UnifiedInvoice, settings: PrinterSettings, width: number): string => {
  // width: 80mm ~ 302px, 58mm ~ 219px (approx scale)
  const pxWidth = width === 80 ? 302 : 219;
  
  return `
    <div style="font-family: ${settings.font.family}; font-size: ${settings.font.size}px; width: ${pxWidth}px; margin: 0 auto; line-height: 1.2;">
      <div style="text-align: center; margin-bottom: 10px;">
        ${settings.invoice.showLogo && invoice.shop.logoUrl ? `<img src="${invoice.shop.logoUrl}" style="max-width: 80%; max-height: 100px; margin-bottom: 5px;" />` : ''}
        ${settings.invoice.showShopInfo ? `
          <div style="font-weight: bold; font-size: 1.2em;">${invoice.shop.name}</div>
          <div>${invoice.shop.address}</div>
          <div>${invoice.shop.phone}</div>
          ${invoice.shop.taxNumber ? `<div>NTN: ${invoice.shop.taxNumber}</div>` : ''}
        ` : ''}
      </div>
      
      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin-bottom: 5px;">
        <div>Inv: ${invoice.invoiceNo}</div>
        <div>Date: ${invoice.date}</div>
        ${invoice.customer ? `<div>Cust: ${invoice.customer.name}</div>` : ''}
      </div>

      <table style="width: 100%; text-align: left; margin-bottom: 5px;">
        <tr style="border-bottom: 1px dashed #000;">
          <th>Item</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Amt</th>
        </tr>
        ${invoice.items.map(item => `
          <tr>
            <td colspan="3" style="padding-top: 3px;">${item.name}</td>
          </tr>
          <tr>
            <td></td>
            <td style="text-align: right;">${item.qty} x ${item.price}</td>
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
      
      <div style="text-align: center; margin-top: 15px;">
        <div>${invoice.shop.footerText || ''}</div>
        ${settings.invoice.showBarcode ? `<div style="margin-top: 10px;">||||||||||||||||||||<br/><small>${invoice.invoiceNo}</small></div>` : ''}
      </div>
    </div>
  `;
};
