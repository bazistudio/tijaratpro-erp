import { db, DBAuditLog } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const auditService = {
  logAction: async (
    entityType: 'transaction' | 'inventory' | 'ledger' | 'user',
    action: 'SALE' | 'REFUND' | 'VOID' | 'STOCK_ADJUST' | 'LOGIN' | 'REPLACE',
    beforeState: any,
    afterState: any,
    user: string = 'system' // Placeholder until Phase 5 Auth
  ) => {
    const logEntry: DBAuditLog = {
      id: `ADT-${Date.now()}-${uuidv4().substring(0, 4)}`,
      entityType,
      action,
      beforeState,
      afterState,
      user,
      timestamp: Date.now()
    };

    await db.auditLogs.add(logEntry);
    return logEntry;
  }
};
