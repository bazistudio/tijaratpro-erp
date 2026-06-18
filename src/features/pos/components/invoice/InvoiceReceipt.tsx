import React, { useEffect } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { InvoiceTemplate } from '../document/invoice.template';
import { DocumentService } from '../../services/document/document.service';
import { Download, Printer, X } from 'lucide-react';

export const InvoiceReceipt = () => {
  const invoice = usePosStore(state => state.lastInvoice);
  const setLastInvoice = usePosStore(state => state.setLastInvoice);

  // When invoice appears, automatically print (it was already triggered by CartSummary, but if we want to ensure it)
  // Actually, CartSummary handles the auto-print. We just render.

  if (!invoice) return null;

  const handlePDF = async () => {
    await DocumentService.generatePDF(invoice);
    await DocumentService.logPrint(invoice.invoiceId, 'PDF');
  };

  const handlePrint = async () => {
    window.print();
    await DocumentService.logPrint(invoice.invoiceId, 'REPRINT');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
        <div className="bg-gray-100 p-4 rounded-xl shadow-2xl max-h-[90vh] flex flex-col w-[350px]">
          
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800">Receipt</h2>
            <button onClick={() => setLastInvoice(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Preview (Scrollable) */}
          <div className="flex-1 overflow-y-auto bg-white rounded shadow-inner mb-4 flex justify-center py-4">
            {/* The actual template is visible here, but scaled down or just fitting */}
            <div className="scale-90 origin-top">
              <InvoiceTemplate invoice={invoice} />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handlePDF}
              className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700 font-semibold text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2 bg-[#006970] text-white rounded shadow-sm hover:bg-[#005a60] font-semibold text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Hidden print container that ONLY shows during printing */}
      <div className="hidden print:block absolute top-0 left-0">
        <InvoiceTemplate invoice={invoice} />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }

          .print\\:block, .print\\:block * {
            visibility: visible;
          }

          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `}} />
    </>
  );
};
