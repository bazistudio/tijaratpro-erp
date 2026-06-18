import Dexie, { Table } from 'dexie';

export interface DBUser {
  id: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
}

export interface DBInventory {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  reservedStock: number;
  lastUpdated: number;
}

export interface DBLedgerEntry {
  id: string;
  transactionId: string;
  type: string;
  debitAccount: 'cash' | 'receivable' | 'inventory' | 'cogs' | 'sales_revenue';
  creditAccount: 'cash' | 'receivable' | 'inventory' | 'sales_revenue' | 'cogs';
  amount: number;
  timestamp: number;
  customerId?: string;
  description?: string;
}

export interface DBAuditLog {
  id: string;
  entityType: 'transaction' | 'inventory' | 'ledger' | 'user';
  action: 'SALE' | 'REFUND' | 'VOID' | 'STOCK_ADJUST' | 'LOGIN' | 'REPLACE' | 'PAYMENT';
  beforeState: any;
  afterState: any;
  user: string;
  timestamp: number;
}

// Re-using Transaction from pos store, but expanding for DB
export interface DBTransaction {
  transactionId: string;
  transactionType: 'sale' | 'replace_exchange' | 'return_only';
  status: 'pending' | 'completed' | 'void' | 'refunded' | 'locked';
  
  items: any[];
  returnedItems: any[];
  
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  
  paymentBreakdown: { method: string; amount: number }[];
  totalPaid: number;
  remainingDue: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  changeReturned: number;
  
  customer: { id: string; name: string } | null;
  
  createdAt: number;
  
  // Locking mechanics
  lockedAt?: number;
  hash?: string;
  version?: number;
  previousHash?: string;
}

export interface DBReconciliation {
  id: string;
  transactionId: string;
  totalAmount: number;
  totalDiscount: number;
  finalAmount: number;
  totalPaid: number;
  remainingDue: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  paymentBreakdown: { method: string; amount: number }[];
  timestamp: number;
}

export interface DBCustomer {
  id: string;
  accountCode: string;
  name: string;
  mobile: string;
  currentBalance: number;
  creditLimit: number;
  createdAt?: number;
}

export interface DBInvoicePrintLog {
  id: string;
  invoiceId: string;
  transactionId: string;
  action: 'PRINT' | 'PDF' | 'REPRINT';
  timestamp: number;
}

export class TijaratDatabase extends Dexie {
  users!: Table<DBUser, string>;
  inventory!: Table<DBInventory, string>;
  transactions!: Table<DBTransaction, string>;
  ledgerEntries!: Table<DBLedgerEntry, string>;
  auditLogs!: Table<DBAuditLog, string>;
  reconciliations!: Table<DBReconciliation, string>;
  customers!: Table<DBCustomer, string>;
  invoicePrintLogs!: Table<DBInvoicePrintLog, string>;

  constructor() {
    super('TijaratERP');
    
    // Schema version 1
    this.version(1).stores({
      users: 'id, role',
      inventory: 'id, sku, name',
      transactions: 'transactionId, createdAt, status, transactionType',
      ledgerEntries: 'id, transactionId, timestamp, type',
      auditLogs: 'id, timestamp, action, entityType'
    });

    // Schema version 2 - Add reconciliations and customers
    this.version(2).stores({
      ledgerEntries: 'id, transactionId, type, timestamp',
      auditLogs: 'id, entityType, action, timestamp, user',
      reconciliations: 'id, transactionId, timestamp',
      customers: 'id, accountCode, name, mobile',
      invoicePrintLogs: 'id, invoiceId, transactionId, action, timestamp'
    });

    // Schema version 3 - Add customerId to ledgerEntries
    this.version(3).stores({
      ledgerEntries: 'id, transactionId, type, timestamp, customerId',
    }).upgrade(tx => {
      // No data migration needed, just index added
    });
  }
}

export const db = new TijaratDatabase();
