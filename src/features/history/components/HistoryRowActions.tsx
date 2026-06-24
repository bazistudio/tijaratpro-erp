import React, { useState } from 'react';
import { MoreHorizontal, FileText, Activity, Printer, Download, User } from 'lucide-react';
import { HistoryItem } from '../types/history.types';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { LedgerTraceModal } from './LedgerTraceModal';

interface Props {
  item: HistoryItem;
}

export const HistoryRowActions: React.FC<Props> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="py-1" role="menu">
              <button
                onClick={() => { setIsOpen(false); setShowPreview(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 font-medium transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                View Document
              </button>
              <button
                onClick={() => { setIsOpen(false); setShowTrace(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 font-medium transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <Activity className="w-4 h-4 text-emerald-500" />
                Ledger Trace (Audit)
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 font-medium transition-colors"
              >
                <Printer className="w-4 h-4 text-gray-400" />
                Print Receipt
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-gray-400" />
                Export JSON
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 font-medium transition-colors border-t border-gray-100 dark:border-gray-700"
              >
                <User className="w-4 h-4 text-purple-500" />
                Open Profile
              </button>
            </div>
          </div>
        </>
      )}

      {showPreview && (
        <InvoicePreviewModal item={item} onClose={() => setShowPreview(false)} />
      )}
      {showTrace && (
        <LedgerTraceModal item={item} onClose={() => setShowTrace(false)} />
      )}
    </div>
  );
};
