import { db, DBLedgerEntry, DBTransaction } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type AccountType = 'cash' | 'receivable' | 'inventory' | 'sales_revenue' | 'cogs';

export const ACCOUNT_MAP = {
  CASH_SALE: { debit: 'cash' as AccountType, credit: 'sales_revenue' as AccountType },
  CREDIT_SALE: { debit: 'receivable' as AccountType, credit: 'sales_revenue' as AccountType },
  PURCHASE_RETURN: { debit: 'inventory' as AccountType, credit: 'cash' as AccountType },
  COGS_ADJUSTMENT: { debit: 'cogs' as AccountType, credit: 'inventory' as AccountType }
};

const createEntry = (
  transactionId: string, 
  type: string, 
  debitAccount: AccountType, 
  creditAccount: AccountType, 
  amount: number
): DBLedgerEntry => {
  if (amount < 0) {
    throw new Error("Ledger Entry cannot have negative amount. Swap debit/credit accounts instead.");
  }

  // ERP Invariant Check (in a true double-entry system, each leg is a row, but here we enforce it structurally)
  // By forcing debitAccount and creditAccount to coexist with the exact same amount, 
  // the equation debit = credit is inherently mathematically satisfied.
  return {
    id: `LDG-${Date.now()}-${uuidv4().substring(0, 4)}`,
    transactionId,
    type,
    debitAccount,
    creditAccount,
    amount,
    timestamp: Date.now()
  };
};

export const ledgerService = {
  processTransaction: async (transaction: DBTransaction) => {
    const entries: DBLedgerEntry[] = [];
    
    // 1. Process New Items (Sales Revenue)
    const newItemsTotal = transaction.subtotal; // subtotal without returns
    
    if (newItemsTotal > 0) {
      if (transaction.paymentMethod === 'credit') {
        entries.push(createEntry(transaction.transactionId, 'CREDIT_SALE', ACCOUNT_MAP.CREDIT_SALE.debit, ACCOUNT_MAP.CREDIT_SALE.credit, newItemsTotal));
      } else {
        entries.push(createEntry(transaction.transactionId, 'CASH_SALE', ACCOUNT_MAP.CASH_SALE.debit, ACCOUNT_MAP.CASH_SALE.credit, newItemsTotal));
      }

      // Process COGS for new items
      const cogsTotal = transaction.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
      if (cogsTotal > 0) {
        entries.push(createEntry(transaction.transactionId, 'COGS_ADJUSTMENT', ACCOUNT_MAP.COGS_ADJUSTMENT.debit, ACCOUNT_MAP.COGS_ADJUSTMENT.credit, cogsTotal));
      }
    }

    // 2. Process Returns
    const returnTotal = transaction.returnedItems.reduce((acc, item) => acc + item.subtotal, 0);
    if (returnTotal > 0) {
      // Reversing the cash flow and inventory
      entries.push(createEntry(transaction.transactionId, 'PURCHASE_RETURN', ACCOUNT_MAP.PURCHASE_RETURN.debit, ACCOUNT_MAP.PURCHASE_RETURN.credit, returnTotal));
      
      // Reverse COGS for returns
      const returnedCogsTotal = transaction.returnedItems.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
      if (returnedCogsTotal > 0) {
        // Debit Inventory, Credit COGS to restore
        entries.push(createEntry(transaction.transactionId, 'RETURN_COGS_ADJUSTMENT', ACCOUNT_MAP.COGS_ADJUSTMENT.credit, ACCOUNT_MAP.COGS_ADJUSTMENT.debit, returnedCogsTotal));
      }
    }

    await db.ledgerEntries.bulkAdd(entries);
    return entries;
  }
};
