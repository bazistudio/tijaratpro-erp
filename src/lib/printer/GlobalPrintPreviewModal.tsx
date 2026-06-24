'use client';
import React, { useRef } from 'react';
import { usePrintStore } from './print.store';
import { X, Printer, Download } from 'lucide-react';

export const GlobalPrintPreviewModal: React.FC = () => {
  const { currentPayload, isPreviewOpen, closePreview } = usePrintStore();
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  // Automatically trigger print when payload is available
  React.useEffect(() => {
    if (isPreviewOpen && currentPayload && printIframeRef.current) {
      const iframe = printIframeRef.current;
      const doc = iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; box-sizing: border-box; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>
              ${currentPayload.html}
            </body>
          </html>
        `);
        doc.close();

        // Trigger print and then automatically close the preview state
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          closePreview(); // Clean up state immediately after opening print dialog
        }, 250);
      }
    }
  }, [isPreviewOpen, currentPayload, closePreview]);

  if (!isPreviewOpen || !currentPayload) return null;

  return (
    <iframe 
      ref={printIframeRef} 
      style={{ display: 'none', position: 'absolute', width: 0, height: 0, border: 0 }} 
    />
  );
};
