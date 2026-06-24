import { create } from 'zustand';

export type PrintDocumentType = 'SaleInvoice' | 'PurchaseInvoice' | 'ExpenseVoucher' | 'PaymentReceipt' | 'Generic';

interface PrintPayload {
  html: string;
  documentType: PrintDocumentType;
  referenceId: string; // The ID of the order/expense/etc.
  title: string;
}

interface PrintState {
  currentPayload: PrintPayload | null;
  isPreviewOpen: boolean;
  isPrinting: boolean;
  
  openPreview: (payload: PrintPayload) => void;
  closePreview: () => void;
  setPrinting: (isPrinting: boolean) => void;
  clearPayload: () => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  currentPayload: null,
  isPreviewOpen: false,
  isPrinting: false,

  openPreview: (payload) => set({ currentPayload: payload, isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),
  setPrinting: (isPrinting) => set({ isPrinting }),
  clearPayload: () => set({ currentPayload: null, isPreviewOpen: false })
}));
