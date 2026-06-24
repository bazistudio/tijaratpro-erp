import React from 'react';
import { Undo2, FileWarning, RefreshCcw, HandCoins, History, Tag, Gift, Users, PenLine, LockOpen, Repeat } from 'lucide-react';
import { usePosStore } from '../store/usePosStore';
import toast from 'react-hot-toast';

export const PosExtraActions = () => {
  const activeSession = usePosStore(state => state.getActiveSession());
  const setSessionMode = usePosStore(state => state.setSessionMode);
  const processCashReturn = usePosStore(state => state.processCashReturn);

  const prepareReplaceExchange = usePosStore(state => state.prepareReplaceExchange);
  const processInvoiceReturn = usePosStore(state => state.processInvoiceReturn);
  const extraActions = [
    { label: 'Cash Return', action: 'processCashReturn', icon: HandCoins, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' },
    { label: 'Replace', action: 'toggleReplace', icon: Repeat, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50' },
    { label: 'Invoice Return', action: 'processInvoiceReturn', icon: Undo2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' },
    { label: 'Invoice Replace', icon: RefreshCcw, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50' },
    { label: 'Hold Sale', icon: History, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' },
    { label: 'Draft Invoice', icon: PenLine, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' },
    { label: 'Open Drawer', icon: LockOpen, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50' },
    { label: 'Discount Override', icon: Tag, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50' },
    { label: 'Apply Coupon', icon: Gift, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/50' },
    { label: 'View Customers', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' },
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
      <div className="border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm flex-1 flex flex-col overflow-hidden w-full">
        <div className="grid grid-cols-2 grid-rows-5 gap-2 flex-1 min-h-0 h-full w-full">
          {extraActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if ((action as any).action === 'toggleReplace') {
                    prepareReplaceExchange();
                  } else if ((action as any).action === 'processCashReturn') {
                    processCashReturn();
                  } else if ((action as any).action === 'processInvoiceReturn') {
                    processInvoiceReturn();
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:-translate-y-0.5 shadow-sm hover:shadow h-full w-full ${action.bg} ${action.color} ${activeSession?.mode === 'replace' && (action as any).action === 'toggleReplace' ? 'ring-2 ring-orange-500 bg-orange-100 dark:bg-orange-900/40' : ''}`}
              >
                <Icon className="h-5 w-5 mb-1.5 shrink-0" />
                <span className="text-[10px] font-bold text-center leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
