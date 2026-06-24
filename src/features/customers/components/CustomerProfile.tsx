import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/services/customer.api';
import { LedgerBook } from '@/features/ledger/components/LedgerBook';
import { Phone, MapPin, FileText, ShoppingCart, DollarSign, Calendar, Printer, Edit, Plus, CreditCard, ArrowLeft } from 'lucide-react';
import { usePrintStore } from '@/lib/printer';
import { usePrinterStore } from '@/features/settings/printer/store/printer.store';
import { printFormatter } from '@/features/settings/printer/utils/printFormatter';
import { useLedger } from '@/features/ledger/hooks/useLedger';

interface CustomerProfileProps {
  id: string;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ id }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { openPreview } = usePrintStore();
  const { settings, shopHeader } = usePrinterStore();

  const { rawTimeline } = useLedger(detail?.customer ? {
    id: detail.customer.id,
    type: 'CUSTOMER',
    name: detail.customer.name,
    balance: detail.stats.outstanding
  } : null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await customerApi.getCustomerDetail(id);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold rounded-lg transition-colors">
              <ShoppingCart className="w-4 h-4" /> New Sale
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold rounded-lg transition-colors">
              <CreditCard className="w-4 h-4" /> Receive Payment
            </button>
            <button 
              onClick={handlePrintFullLedger}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Ledger
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors">
              <Edit className="w-4 h-4" /> Edit Customer
            </button>
          </div>

          {/* Recent Invoices Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Sales</h3>
            <div className="space-y-3">
              {stats.recentInvoices.length > 0 ? stats.recentInvoices.map((inv: any) => (
                <div key={inv._id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{inv.orderNumber}</div>
                    <div className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">Rs {inv.totalAmount?.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500 text-center py-4">No recent sales</div>
              )}
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
    </div>
  );
};
