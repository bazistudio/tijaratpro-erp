'use client';
import React, { useRef } from 'react';
import { usePrintStore } from './print.store';
import { X, Printer, Download } from 'lucide-react';

export const GlobalPrintPreviewModal: React.FC = () => {
  const { currentPayload, isPreviewOpen, closePreview } = usePrintStore();
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  if (!isPreviewOpen || !currentPayload) return null;

  const handlePrint = () => {
    if (!printIframeRef.current) return;
    const iframe = printIframeRef.current;
    
    // Write content to iframe
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      // Ensure the iframe has styles to remove margins on print
      doc.write(`
        <html>
          <head>
            <style>
              @page { margin: 0; }
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>
            ${currentPayload.html}
          </body>
        </html>
      `);
      doc.close();

      // Trigger print after a tiny delay to ensure images/fonts load
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.createElement('div');
    element.innerHTML = currentPayload.html;
    
    const opt = {
      margin: 0,
      filename: `${currentPayload.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm">
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Print Preview</h2>
            <p className="text-sm text-neutral-500">{currentPayload.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
            <button onClick={closePreview} className="p-2 text-neutral-500 hover:text-red-600 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-200 dark:bg-neutral-800/50 flex justify-center">
          <div 
            className="bg-white shadow-md"
            // We use dangerouslySetInnerHTML to render the exact HTML
            dangerouslySetInnerHTML={{ __html: currentPayload.html }}
          />
        </div>

      </div>

      {/* Hidden iframe for native browser printing */}
      <iframe 
        ref={printIframeRef} 
        style={{ display: 'none', position: 'absolute', width: 0, height: 0, border: 0 }} 
      />
    </div>
  );
};
