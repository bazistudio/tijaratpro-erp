import { SaleSession, CartItem } from '../store/usePosStore';

export class FinancialMathEngine {
  static calculateTotals(session: SaleSession) {
    const cart = session.cart || [];
    const returnedItems = session.returnedItems || [];

    const itemSubtotal = cart.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
    const returnTotal = returnedItems.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);

    const discountTotal = cart.reduce((sum: number, item: CartItem) => sum + item.discount, 0);

    const newItemsTotal = itemSubtotal - discountTotal;
    const preFinalTotal = newItemsTotal - returnTotal;

    let invoiceDiscountAmount = 0;
    if (session.invoiceDiscountType === 'percentage') {
      invoiceDiscountAmount = preFinalTotal * ((session.invoiceDiscountValue || 0) / 100);
    } else {
      invoiceDiscountAmount = session.invoiceDiscountValue || 0;
    }

    const finalAmount = Math.max(0, preFinalTotal - invoiceDiscountAmount);

    return {
      subtotal: itemSubtotal,
      discountTotal,
      invoiceDiscountAmount,
      returnTotal,
      newItemsTotal,
      finalAmount
    };
  }

  static calculatePayments(total: number, breakdown: { method: string; amount: number }[]) {
    const totalPaid = breakdown.reduce((sum, p) => sum + p.amount, 0);
    const remainingDue = Math.max(0, total - totalPaid);

    const status: 'PAID' | 'PARTIAL' | 'DUE' = totalPaid === 0 ? 'DUE' : remainingDue > 0 ? 'PARTIAL' : 'PAID';
    const changeReturned = totalPaid > total ? totalPaid - total : 0;

    return {
      totalPaid,
      remainingDue,
      paymentStatus: status,
      changeReturned
    };
  }
}
