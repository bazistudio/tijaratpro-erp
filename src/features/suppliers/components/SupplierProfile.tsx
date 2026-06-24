import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supplierApi } from '@/services/supplier.api';
import { LedgerBook } from '@/features/ledger/components/LedgerBook';
import { Phone, MapPin, FileText, ShoppingCart, DollarSign, Calendar, Printer, Edit, Plus, CreditCard, ArrowLeft, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrintStore } from '@/lib/printer';
import { downloadHtmlAsPdf } from '@/lib/printer/pdfExport';
import { usePrinterStore } from '@/features/settings/printer/store/printer.store';
import { printFormatter } from '@/features/settings/printer/utils/printFormatter';
import { useLedger } from '@/features/ledger/hooks/useLedger';

interface SupplierProfileProps {
  id: string;
}

export const SupplierProfile: React.FC<SupplierProfileProps> = ({ id }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { openPreview } = usePrintStore();
  const { settings, shopHeader, fetchSettings } = usePrinterStore();
  const [expandedPurchases, setExpandedPurchases] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!settings || !shopHeader) {
      fetchSettings();
    }
  }, [settings, shopHeader, fetchSettings]);

  const togglePurchase = (id: string) => {
    setExpandedPurchases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintPurchase = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    if (!settings || !shopHeader) return;
    const html = printFormatter.formatPurchaseInvoice({
      invoiceNumber: p.purchaseNumber,
      createdAt: p.createdAt,
      supplierId: { name: detail?.supplier?.name },
      items: p.items.map((i: any) => ({ name: i.productId?.name || 'Unknown Item', qty: i.qty || i.quantity || 0, price: i.price || 0, total: (i.qty || i.quantity || 0) * (i.price || 0) })),
      totalAmount: p.totalAmount,
      paymentMethod: p.paymentMethod || 'Cash',
      status: p.status
    }, settings, shopHeader);
    openPreview({ html, documentType: 'PurchaseInvoice', referenceId: p.purchaseNumber, title: 'Purchase Invoice' });
  };

  const { rawTimeline } = useLedger(detail?.supplier ? {
    id: detail.supplier.id,
    type: 'SUPPLIER',
    name: detail.supplier.name,
    balance: detail.stats.payable // positive if they owe us, negative if we owe them. Wait, useLedger balance expects actual balance.
  } : null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await supplierApi.getSupplierDetail(id);
        setDetail(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!detail || !detail.supplier) {
    return <div>Supplier not found</div>;
  }

  const { supplier, stats } = detail;
  // For supplier, balance > 0 means they owe us (advance), balance < 0 means we owe them (payable)
  // Let's use actual balance for LedgerBook
  const actualBalance = supplier.currentBalance || 0;
  const isAdvance = actualBalance > 0;
  const isPayable = actualBalance < 0;

  const handlePrintFullLedger = () => {
    if (!settings || !shopHeader || !rawTimeline) return;
    const html = printFormatter.formatLedgerStatement(
      { id: supplier.id, type: 'SUPPLIER', name: supplier.name, balance: actualBalance },
      rawTimeline,
      settings,
      shopHeader,
      'Full Ledger'
    );
    openPreview({ html, documentType: 'Generic', referenceId: 'ledger', title: 'Ledger Statement' });
  };

  const handleDownloadFullLedgerPDF = () => {
    if (!settings || !shopHeader || !rawTimeline) return;
    const html = printFormatter.formatLedgerStatement(
      { id: supplier.id, type: 'SUPPLIER', name: supplier.name, balance: actualBalance },
      rawTimeline,
      settings,
      shopHeader,
      'Full Ledger'
    );
    downloadHtmlAsPdf(html, `Ledger_${supplier.name.replace(/\s+/g, '_')}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto -mt-[30px]">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Details & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-3xl font-black mb-4">
              {supplier.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{supplier.name}</h2>
            
            <div className="space-y-2 mt-4 text-left w-full text-sm">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Building2 className="w-4 h-4" />
                <span>{supplier.companyName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{supplier.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Last TX: {stats.lastTransactionDate ? new Date(stats.lastTransactionDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 font-semibold rounded-lg transition-colors">
              <ShoppingCart className="w-4 h-4" /> New Purchase
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 font-semibold rounded-lg transition-colors">
              <CreditCard className="w-4 h-4" /> Make Payment
            </button>
            <button 
              onClick={handlePrintFullLedger}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 active:scale-95 active:bg-blue-600 active:text-white dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:active:bg-blue-600 transition-all font-semibold rounded-lg text-gray-700 dark:text-gray-300"
            >
              <Printer className="w-4 h-4" /> Print Ledger
            </button>
            <button 
              onClick={handleDownloadFullLedgerPDF}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 active:scale-95 active:bg-blue-600 active:text-white dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:active:bg-blue-600 transition-all font-semibold rounded-lg text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" /> Export Ledger PDF
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors">
              <Edit className="w-4 h-4" /> Edit Supplier
            </button>
          </div>

          {/* Recent Purchases Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Purchases</h3>
            <div className="space-y-3">
              {stats.recentPurchases.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No recent purchases</div>
              )}
              {stats.recentPurchases.length > 0 && stats.recentPurchases.map((p: any) => (
                <div key={p._id || p.purchaseNumber} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div 
                    className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded transition-colors"
                    onClick={() => togglePurchase(p._id || p.purchaseNumber)}
                  >
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-500">
                        {expandedPurchases[p._id || p.purchaseNumber] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{p.purchaseNumber || p.transactionId}</div>
                        <div className="text-xs text-gray-500">{new Date(p.createdAt || p.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">Rs {(p.totalAmount || p.amount)?.toLocaleString()}</div>
                        {p.status && (
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {p.status}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handlePrintPurchase(e, p)}
                          className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Print/PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedPurchases[p._id || p.purchaseNumber] && p.items && (
                    <div className="mt-2 pl-8 pr-2 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-gray-500 mb-1 flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                        <span>Item</span>
                        <span>Amount</span>
                      </div>
                      {p.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>{item.qty || item.quantity}x {item.productId?.name || 'Item'}</span>
                          <span>Rs {((item.qty || item.quantity) * item.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: KPIs & Ledger */}
        <div className="lg:col-span-3 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Total Purchases</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">Rs {stats.totalPurchases.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isPayable ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">{isPayable ? 'Payable' : 'Advance'}</p>
                <p className={`text-2xl font-black ${isPayable ? 'text-orange-600' : 'text-green-600'}`}>Rs {Math.abs(actualBalance).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Purchases</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.purchaseCount}</p>
              </div>
            </div>
          </div>

          {/* LedgerBook Component (Readonly) */}
          <LedgerBook 
            initialParty={{
              id: supplier.id,
              type: 'SUPPLIER',
              name: supplier.name,
              balance: actualBalance
            }}
            readonly={true}
          />
        </div>

      </div>
    </div>
  );
};
