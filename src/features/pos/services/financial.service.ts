import Dexie from 'dexie';
import { db, DBTransaction, DBReconciliation } from '@/lib/db';
import { FinancialMathEngine } from './financialMath.engine';
import { SaleSession } from '../store/usePosStore';

export class FinancialService {
  static async processTransaction(input: {
    session: SaleSession;
    paymentBreakdown: { method: string; amount: number }[];
    customer: { id: string; name: string } | null;
  }) {
    return await db.transaction(
      'rw',
      db.transactions,
      db.reconciliations,
      db.customers,
      async () => {
        // 1. PURE CALCULATION
        const financial = FinancialMathEngine.calculateTotals(input.session);
        const payment = FinancialMathEngine.calculatePayments(
          financial.finalAmount,
          input.paymentBreakdown
        );

        // 2. BUILD TRANSACTION
        const transaction: DBTransaction = {
          transactionId: input.session.transactionId,
          transactionType: input.session.transactionType,
          status: 'completed',

          items: input.session.cart,
          returnedItems: input.session.returnedItems,

          subtotal: financial.subtotal,
          discountTotal: financial.discountTotal,
          grandTotal: financial.finalAmount,

          paymentBreakdown: input.paymentBreakdown,

          totalPaid: payment.totalPaid,
          remainingDue: payment.remainingDue,
          paymentStatus: payment.paymentStatus,
          changeReturned: payment.changeReturned,

          customer: input.customer,
          createdAt: Date.now(),
        };

        // 3. RECONCILIATION
        const reconciliation: DBReconciliation = {
          id: `REC-${transaction.transactionId}`,
          transactionId: transaction.transactionId,

          totalAmount: financial.subtotal,
          totalDiscount: financial.discountTotal + financial.invoiceDiscountAmount,
          finalAmount: financial.finalAmount,

          totalPaid: payment.totalPaid,
          remainingDue: payment.remainingDue,
          paymentStatus: payment.paymentStatus,

          paymentBreakdown: input.paymentBreakdown,
          timestamp: Date.now(),
        };

        // 4. ATOMIC WRITE
        await db.transactions.add(transaction);
        await db.reconciliations.add(reconciliation);

        // 5. CUSTOMER CREDIT
        if (payment.remainingDue > 0 && input.customer) {
          const customerRecord = await db.customers.get(input.customer.id);
          if (customerRecord) {
            await db.customers.update(input.customer.id, {
              currentBalance: customerRecord.currentBalance + payment.remainingDue
            });
          }
        }

        return { transaction, reconciliation };
      }
    );
  }

  static async receiveCustomerPayment(
    customerId: string,
    amount: number,
    method: string,
    notes?: string
  ) {
    return await db.transaction(
      'rw',
      db.customers,
      db.ledgerEntries,
      db.auditLogs,
      async () => {
        const customer = await db.customers.get(customerId);
        if (!customer) throw new Error('Customer not found');

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error('Payment amount must be greater than zero');
        }

        // 1. Update customer balance (reducing the debt)
        if (amount > customer.currentBalance) {
          throw new Error('Payment exceeds outstanding balance');
        }
        const newBalance = customer.currentBalance - amount;
        await db.customers.update(customerId, { currentBalance: newBalance });

        // 2. Create Ledger Entry
        // We received payment, so Debit Cash/Bank, Credit Receivable
        const ledgerEntryId = crypto.randomUUID();
        await db.ledgerEntries.add({
          id: ledgerEntryId,
          transactionId: `PAY-${Date.now()}`,
          type: 'payment',
          debitAccount: 'cash', // Simplified: could be bank/jazzcash
          creditAccount: 'receivable',
          amount: amount,
          timestamp: Date.now(),
          customerId: customerId,
          description: `Payment Received - ${method}${notes ? ` - ${notes}` : ''}`
        });

        // 3. Create Audit Log
        await db.auditLogs.add({
          id: crypto.randomUUID(),
          entityType: 'ledger',
          action: 'PAYMENT',
          beforeState: { balance: customer.currentBalance },
          afterState: { balance: newBalance, paymentId: ledgerEntryId },
          user: 'System', // In real app, get from auth context
          timestamp: Date.now()
        });

        return { success: true, newBalance };
      }
    );
  }

  // Utility to reconcile customer balance from ledger source of truth
  static async recalculateCustomerBalance(customerId: string) {
    return await db.transaction('rw', db.customers, db.ledgerEntries, async () => {
      const customer = await db.customers.get(customerId);
      if (!customer) throw new Error('Customer not found');

      const entries = await db.ledgerEntries.where({ customerId }).toArray();
      let calculatedBalance = 0;

      for (const entry of entries) {
        if (entry.debitAccount === 'receivable') {
          calculatedBalance += entry.amount;
        } else if (entry.creditAccount === 'receivable') {
          calculatedBalance -= entry.amount;
        }
      }

      await db.customers.update(customerId, { currentBalance: calculatedBalance });
      return calculatedBalance;
    });
  }
}
