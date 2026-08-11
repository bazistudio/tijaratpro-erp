'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import axiosInstance from '@/lib/api/axios';
import toast from 'react-hot-toast';
import { 
  Sliders, Save, Printer, Percent, ShieldCheck, 
  PackageCheck, DollarSign, Receipt, Loader2, RefreshCw 
} from 'lucide-react';

export default function OrganizationConfigPage() {
  const { user } = useAuthStore();
  const { activeShopId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [config, setConfig] = useState({
    defaultTaxRate: 18,
    taxInclusive: false,
    allowNegativeStock: false,
    defaultLowStockThreshold: 5,
    autoPrintReceipt: true,
    paperSize: '80mm',
    receiptFooterMessage: 'Thank you for shopping with us!',
    allowPOSDiscount: true,
    maxDiscountPercent: 25,
    strictInventoryLock: false,
    sessionTimeoutMinutes: 60,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/v1/settings');
      if (res.data) {
        const data = res.data;
        setConfig((prev) => ({
          ...prev,
          defaultTaxRate: data.defaultTaxRate ?? prev.defaultTaxRate,
          taxInclusive: data.taxInclusive ?? prev.taxInclusive,
          allowNegativeStock: data.allowNegativeStock ?? prev.allowNegativeStock,
          defaultLowStockThreshold: data.defaultLowStockThreshold ?? prev.defaultLowStockThreshold,
          autoPrintReceipt: data.printer?.autoPrint ?? prev.autoPrintReceipt,
          paperSize: data.printer?.paperSize?.width || '80mm',
          receiptFooterMessage: data.receiptFooterMessage || prev.receiptFooterMessage,
          allowPOSDiscount: data.allowPOSDiscount ?? prev.allowPOSDiscount,
          maxDiscountPercent: data.maxDiscountPercent ?? prev.maxDiscountPercent,
          strictInventoryLock: data.strictInventoryLock ?? prev.strictInventoryLock,
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load business configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.put('/api/v1/settings', config);
      toast.success('Business configuration updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Business Configuration</h1>
          <p className="text-sm text-text-muted mt-1">
            Configure default operational rules, sales tax policies, and inventory controls across branches.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Business Rules
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sales & POS Policies */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-text-primary">Sales & POS Policies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Default Sales Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.defaultTaxRate}
                onChange={(e) => setConfig({ ...config, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Maximum Manual Discount Allowed (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.maxDiscountPercent}
                onChange={(e) => setConfig({ ...config, maxDiscountPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary block">Tax Inclusive Pricing</span>
                <span className="text-xs text-text-muted">Display product prices with tax already included</span>
              </div>
              <input
                type="checkbox"
                checked={config.taxInclusive}
                onChange={(e) => setConfig({ ...config, taxInclusive: e.target.checked })}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary block">Allow POS Item Discounts</span>
                <span className="text-xs text-text-muted">Permit cashiers to apply item level discounts at checkout</span>
              </div>
              <input
                type="checkbox"
                checked={config.allowPOSDiscount}
                onChange={(e) => setConfig({ ...config, allowPOSDiscount: e.target.checked })}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Inventory Controls */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <PackageCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-text-primary">Inventory Controls & Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Default Low Stock Alert Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                value={config.defaultLowStockThreshold}
                onChange={(e) => setConfig({ ...config, defaultLowStockThreshold: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-text-muted mt-1">Triggers low-stock alerts when quantity falls below this value.</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary block">Allow Negative Stock Sales</span>
                <span className="text-xs text-text-muted">Permit selling items even when stock count is zero</span>
              </div>
              <input
                type="checkbox"
                checked={config.allowNegativeStock}
                onChange={(e) => setConfig({ ...config, allowNegativeStock: e.target.checked })}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Receipt & Printer Defaults */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-text-primary">Receipt & Printing Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Thermal Paper Width
              </label>
              <select
                value={config.paperSize}
                onChange={(e) => setConfig({ ...config, paperSize: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="80mm">Standard Thermal (80mm / 3 inch)</option>
                <option value="58mm">Compact Thermal (58mm / 2 inch)</option>
                <option value="A4">A4 Full Page Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Receipt Footer Message
              </label>
              <input
                type="text"
                value={config.receiptFooterMessage}
                onChange={(e) => setConfig({ ...config, receiptFooterMessage: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                placeholder="Custom thank you message on printed invoice"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary block">Auto-Print Thermal Receipt</span>
                <span className="text-xs text-text-muted">Automatically send invoice to printer upon sale completion</span>
              </div>
              <input
                type="checkbox"
                checked={config.autoPrintReceipt}
                onChange={(e) => setConfig({ ...config, autoPrintReceipt: e.target.checked })}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Business Rules
          </button>
        </div>
      </form>
    </div>
  );
}

