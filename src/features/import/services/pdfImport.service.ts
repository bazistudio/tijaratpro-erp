import { ParsedInvoice, UnifiedImportPayload, PurchaseOptions } from '../types/import.types';
import { db } from '@/lib/db';
import { FinancialService } from '@/features/pos/services/financial.service';
import { productService } from '@/features/inventory/product/product.service';
import { stockService } from '@/features/inventory/stock/stock.service';
import { InventoryAdjustmentType } from '@/features/inventory/types';
import { normalizePakPhone } from '@/utils/phoneUtils';

export const pdfImportService = {
  extractPdfText: async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (err) {
      console.error('Error extracting PDF text:', err);
      throw new Error('Failed to extract text from PDF. It might be a scanned image or corrupted.');
    }
  },

  parseInvoiceData: (text: string): ParsedInvoice => {
    // V1 Regex Parsing (Basic rules, assumes standard text-based invoice)
    const nameMatch = text.match(/Customer:\s*([a-zA-Z\s]+)/i) || text.match(/Name:\s*([a-zA-Z\s]+)/i);
    const phoneMatch = text.match(/Phone:\s*([\d\-\+\s]+)/i) || text.match(/Mobile:\s*([\d\-\+\s]+)/i);
    const totalMatch = text.match(/Total(?: Amount)?:\s*(?:Rs\.?|PKR)?\s*([\d,\.]+)/i);
    const dateMatch = text.match(/Date:\s*([\d\/\-\.]+)/i);

    const customerName = nameMatch ? nameMatch[1].trim() : 'Unknown Customer';
    let phone = phoneMatch ? phoneMatch[1].trim() : '';
    phone = phone ? normalizePakPhone(phone) : '00000000000';

    const rawTotal = totalMatch ? totalMatch[1].replace(/,/g, '') : '0';
    const totalAmount = parseFloat(rawTotal) || 0;
    
    const date = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString();

    // Try to find items using a simple pattern: qty x price Name
    // For V1, we'll try to extract items, or leave empty if the format is unknown
    const items: ParsedInvoice['items'] = [];
    const itemRegex = /(\d+)\s*x\s*([\d,\.]+)\s*([a-zA-Z0-9\s]+)/gi;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      items.push({
        qty: parseInt(match[1]),
        price: parseFloat(match[2].replace(/,/g, '')),
        name: match[3].trim()
      });
    }

    return {
      customerName,
      phone,
      totalAmount,
      date,
      items
    };
  },

  normalizeImportPayload: (parsedData: ParsedInvoice): UnifiedImportPayload => {
    return {
      type: 'invoice-import',
      customer: {
        name: parsedData.customerName,
        phone: parsedData.phone
      },
      items: parsedData.items,
      totalAmount: parsedData.totalAmount,
      date: parsedData.date,
      source: 'pdf'
    };
  },

  validateParsedData: (data: ParsedInvoice) => {
    const errors: string[] = [];
    // V1 Relaxed Rules: As requested, Name, Phone, and Total Amount are not strictly required 
    // to allow admins to just import and manage products directly.
    return errors;
  },

  commitImport: async (payload: UnifiedImportPayload, options: PurchaseOptions) => {
    // 1. Supplier Resolution
    let finalSupplierId = options.supplierId || '';

    if (options.type === 'credit' && !finalSupplierId) {
      // If not exists, create new supplier from invoice header
      finalSupplierId = crypto.randomUUID();
      await db.suppliers.add({
        id: finalSupplierId,
        name: payload.customer.name, // treated as supplier from invoice
        mobile: payload.customer.phone,
        currentBalance: 0,
        createdAt: Date.now()
      });
    }

    // 2. Process Items (With Pricing Override)
    let computedTotalCost = 0;

    for (const item of payload.items) {
      const override = options.priceOverrides?.[item.name];
      const costPrice = override?.costPrice ?? item.price;
      const salePrice = override?.salePrice ?? (item.price * 1.20); // V1.1 rule: 20% markup default

      computedTotalCost += (costPrice * item.qty);

      try {
        const existingProducts = await db.inventory.where('name').equalsIgnoreCase(item.name).toArray();
        let productId = '';

        if (existingProducts.length > 0) {
          productId = existingProducts[0].id;
          // Optionally update existing prices here if desired, but we'll stick to new products or stock updates for now
          await db.inventory.update(productId, { costPrice, salePrice });
        } else {
          // If product service doesn't support purchasePrice directly, we'll map to costPrice via standard attributes
          const newProduct = await productService.createProduct({
            name: item.name,
            sku: `IMP-${Date.now().toString().slice(-6)}`,
            category: 'imported',
            price: salePrice,
            purchasePrice: costPrice,
            quantity: 0, 
            lowStockThreshold: 10
          });
          productId = newProduct.id || newProduct._id;
        }

        // Add the stock
        await stockService.adjustStock(
          productId,
          item.qty,
          InventoryAdjustmentType.RESTOCK,
          'Procurement Import'
        );
      } catch (err) {
        console.error(`Failed to process imported item ${item.name}`, err);
      }
    }

    // Use computed cost if items were extracted, fallback to payload total
    const finalAmount = computedTotalCost > 0 ? computedTotalCost : payload.totalAmount;

    // 3. Accounting Flows
    if (options.type === 'cash') {
      // CASH PURCHASE FLOW
      // Debit: inventory, Credit: cash (effect: stock up, cash down)
      const ledgerEntryId = crypto.randomUUID();
      await db.ledgerEntries.add({
        id: ledgerEntryId,
        transactionId: `PROC-CASH-${Date.now()}`,
        type: 'supplier_invoice', // or cash_purchase
        debitAccount: 'inventory',
        creditAccount: 'cash',
        amount: finalAmount,
        timestamp: Date.now(),
        description: 'Cash Procurement Import'
      });
      
      await db.auditLogs.add({
        id: crypto.randomUUID(),
        entityType: 'ledger',
        action: 'IMPORT_PURCHASE',
        beforeState: {},
        afterState: { type: 'cash', amount: finalAmount },
        user: 'System',
        timestamp: Date.now()
      });
    } else {
      // CREDIT PURCHASE FLOW
      // Debit: inventory, Credit: payable
      const ledgerEntryId = crypto.randomUUID();
      await db.ledgerEntries.add({
        id: ledgerEntryId,
        transactionId: `PROC-CRED-${Date.now()}`,
        type: 'supplier_invoice',
        debitAccount: 'inventory',
        creditAccount: 'payable',
        amount: finalAmount,
        supplierId: finalSupplierId,
        timestamp: Date.now(),
        description: 'Credit Procurement Import'
      });

      // Update supplier payable balance
      const supplier = await db.suppliers.get(finalSupplierId);
      if (supplier) {
        await db.suppliers.update(finalSupplierId, {
          currentBalance: supplier.currentBalance + finalAmount
        });
      }

      await db.auditLogs.add({
        id: crypto.randomUUID(),
        entityType: 'ledger',
        action: 'IMPORT_PURCHASE',
        beforeState: { supplierBalance: supplier?.currentBalance || 0 },
        afterState: { supplierBalance: (supplier?.currentBalance || 0) + finalAmount },
        user: 'System',
        timestamp: Date.now()
      });
    }

    return { success: true, supplierId: finalSupplierId };
  }
};
