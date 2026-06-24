import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/services/customer.api';
import { LedgerBook } from '@/features/ledger/components/LedgerBook';
import { Phone, MapPin, FileText, ShoppingCart, DollarSign, Calendar, Printer, Edit, Plus, CreditCard, ArrowLeft, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { usePrintStore } from '@/lib/printer';
import { downloadHtmlAsPdf } from '@/lib/printer/pdfExport';
import { usePrinterStore } from '@/features/settings/printer/store/printer.store';
import { printFormatter } from '@/features/settings/printer/utils/printFormatter';
import { useLedger } from '@/features/ledger/hooks/useLedger';
import { ReceivePaymentModal } from './ledger/ReceivePaymentModal';

interface CustomerProfileProps {
  id: string;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ id }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { openPreview } = usePrintStore();
  const { settings, shopHeader, fetchSettings } = usePrinterStore();
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!settings || !shopHeader) {
      fetchSettings();
    }
  }, [settings, shopHeader, fetchSettings]);

  const toggleInvoice = (id: string) => {
    setExpandedInvoices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintInvoice = (e: React.MouseEvent, inv: any) => {
    e.stopPropagation();
    if (!settings || !shopHeader) return;
    const html = printFormatter.formatSaleInvoice({
      orderNumber: inv.orderNumber,
      createdAt: inv.createdAt,
      customerId: { name: detail?.customer?.name, phone: detail?.customer?.phone },
      items: inv.items.map((i: any) => ({ name: i.productId?.name || 'Unknown Item', qty: i.qty || i.quantity || 0, price: i.price || 0, total: (i.qty || i.quantity || 0) * (i.price || 0) })),
      totalAmount: inv.totalAmount,
      paymentMethod: inv.paymentMethod || 'Cash',
      status: inv.status
    }, settings, shopHeader);
    openPreview({ html, documentType: 'SaleInvoice', referenceId: inv.orderNumber, title: 'Sale Invoice' });
  };

  const { rawTimeline } = useLedger(detail?.customer ? {
    id: detail.customer.id,
    type: 'CUSTOMER',
    name: detail.customer.name,
    balance: detail.stats.outstanding
  } : null);

  const fetchDetail = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerApi.getCustomerDetail(id);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!detail || !detail.customer) {
    return <div>Customer not found</div>;
  }

  const { customer, stats } = detail;
  const isCredit = stats.outstanding < 0;

  const handlePrintFullLedger = () => {
    if (!settings || !shopHeader || !rawTimeline) return;
    const html = printFormatter.formatLedgerStatement(
      { id: customer.id, type: 'CUSTOMER', name: customer.name, balance: stats.outstanding },
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
      { id: customer.id, type: 'CUSTOMER', name: customer.name, balance: stats.outstanding },
      rawTimeline,
      settings,
      shopHeader,
      'Full Ledger'
    );
    downloadHtmlAsPdf(html, `Ledger_${customer.name.replace(/\s+/g, '_')}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-[30px]">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Details & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-black mb-4">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{customer.name}</h2>
            
            <div className="space-y-2 mt-4 text-left w-full text-sm">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{customer.address || 'N/A'}</span>
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
            <button 
              onClick={() => router.push(`/dashboard/shop-admin/pos?customerId=${customer.id}`)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> New Sale
            </button>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Receive Payment
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
              <Edit className="w-4 h-4" /> Edit Customer
            </button>
          </div>

          {/* Recent Invoices Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Sales</h3>
            <div className="space-y-3">
              {stats.recentInvoices.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No recent sales</div>
              )}
              {stats.recentInvoices.length > 0 && stats.recentInvoices.slice(0, 5).map((inv: any) => (
                <div key={inv._id || inv.orderNumber} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div 
                    className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded transition-colors"
                    onClick={() => toggleInvoice(inv._id || inv.orderNumber)}
                  >
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-500">
                        {expandedInvoices[inv._id || inv.orderNumber] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{inv.orderNumber}</div>
                        <div className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">Rs {inv.totalAmount?.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {inv.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handlePrintInvoice(e, inv)}
                          className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Print/PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedInvoices[inv._id || inv.orderNumber] && inv.items && (
                    <div className="mt-2 pl-8 pr-2 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-gray-500 mb-1 flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                        <span>Item</span>
                        <span>Amount</span>
                      </div>
                      {inv.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>{item.qty || item.quantity}x {item.productId?.name || 'Item'}</span>
                          <span>Rs {((item.qty || item.quantity) * item.price).toLocaleString()}</span>
                        </div>
                      ))}
                      {inv.items.length > 3 && (
                        <div className="text-center text-[10px] text-gray-400 font-medium italic mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                          + {inv.items.length - 3} more items
                        </div>
                      )}
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
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Total Sales</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">Rs {stats.totalSales.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isCredit ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">{isCredit ? 'Advance' : 'Outstanding'}</p>
                <p className={`text-2xl font-black ${isCredit ? 'text-green-600' : 'text-orange-600'}`}>Rs {Math.abs(stats.outstanding).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Invoices</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.invoiceCount}</p>
              </div>
            </div>
          </div>

          {/* LedgerBook Component (Readonly) */}
          <LedgerBook 
            initialParty={{
              id: customer.id,
              type: 'CUSTOMER',
              name: customer.name,
              balance: stats.outstanding
            }}
            readonly={true}
          />
        </div>
      </div>

      <ReceivePaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        customer={customer}
        onPaymentSuccess={fetchDetail}
      />
    </div>
  );
};
