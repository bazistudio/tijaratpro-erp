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
  debitAccount: 'cash' | 'receivable' | 'inventory' | 'cogs';
  creditAccount: 'cash' | 'receivable' | 'inventory' | 'sales_revenue';
  amount: number;
  timestamp: number;
}

export interface DBAuditLog {
  id: string;
  entityType: 'transaction' | 'inventory' | 'ledger' | 'user';
  action: 'SALE' | 'REFUND' | 'VOID' | 'STOCK_ADJUST' | 'LOGIN' | 'REPLACE';
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
  
  paymentMethod: string;
  cashReceived: number;
  changeReturned: number;
  
  customer: { id: string; name: string } | null;
  
  createdAt: number;
  
  // Locking mechanics
  lockedAt?: number;
  hash?: string;
  version?: number;
  previousHash?: string;
}

export class TijaratDatabase extends Dexie {
  users!: Table<DBUser, string>;
  inventory!: Table<DBInventory, string>;
  transactions!: Table<DBTransaction, string>;
  ledgerEntries!: Table<DBLedgerEntry, string>;
  auditLogs!: Table<DBAuditLog, string>;

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
  }
}

export const db = new TijaratDatabase();
