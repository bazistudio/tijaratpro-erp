'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { subscriptionApi, SubscriptionData, PaymentRequestData } from '@/services/subscription.api';
import toast from 'react-hot-toast';
import { 
  CreditCard, ShieldCheck, Zap, Store, Users, 
  Package, Clock, CheckCircle2, ArrowUpRight, Plus, Loader2, Shield, AlertCircle 
} from 'lucide-react';

export default function OrganizationBillingPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const orgId = activeOrganizationId || user?.organizationId;

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Renewal Form
  const [form, setForm] = useState({
    amount: 15000,
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
    notes: 'Subscription renewal request'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, reqRes] = await Promise.all([
        subscriptionApi.getSubscriptions(),
        subscriptionApi.getPaymentRequests()
      ]);

      if (subRes?.data && subRes.data.length > 0) {
        setSubscription(subRes.data[0]);
      }
      if (reqRes?.data) {
        setPaymentRequests(reqRes.data);
      }
    } catch (err: any) {
      console.warn('Subscription fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const handleSubmitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.transactionId.trim()) {
      toast.error('Please provide a bank transaction ID / reference number');
      return;
    }

    try {
      setSubmitting(true);
      await subscriptionApi.createPaymentRequest({
        ownerType: 'ORGANIZATION',
        ownerId: orgId,
        amount: form.amount,
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        notes: form.notes
      });
      toast.success('Payment renewal request submitted for admin verification');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit payment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission(PERMISSIONS.ORG_BILLING_MANAGE) && !hasPermission(PERMISSIONS.ORG_SETTINGS_MANAGE)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view or manage organization billing.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Billing & Subscriptions</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Manage your organization plan, resource quotas, and renewal payment receipts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all"
        >
          <Zap className="w-4 h-4" /> Renew / Upgrade Plan
        </button>
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Active Plan
              </span>
              <span className="text-xs text-text-muted font-medium">
                Cycle: Annual
              </span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              {typeof subscription?.packageId === 'object' ? subscription.packageId.name : 'Enterprise Pro Plan'}
            </h2>
            <p className="text-sm text-text-muted">
              Full access to multi-shop management, inventory transfers, and BI analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase block">Status</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase block">Remaining Days</span>
              <span className="text-sm font-bold text-text-primary mt-1 block">
                {subscription?.remainingDays || 340} Days Left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Usage Grid */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-4">Resource Quotas & Allocation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">Shops / Branches</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary">3 / 5 Active</h4>
              <div className="w-full bg-muted/40 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium">Staff Members</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary">8 / 20 Active</h4>
              <div className="w-full bg-muted/40 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium">Product Catalog</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary">1,240 Registered</h4>
              <p className="text-xs text-text-muted mt-2">Unlimited Products Supported</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-medium">Cloud Storage</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary">2.4 GB Used</h4>
              <div className="w-full bg-muted/40 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Requests History Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden space-y-4 p-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Renewal Payment Requests</h3>
          <p className="text-xs text-text-muted">History of manual bank transfers and payment verification requests.</p>
        </div>

        {paymentRequests.length === 0 ? (
          <p className="text-sm text-text-muted pt-2">No payment requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-text-muted text-xs uppercase font-semibold">
                  <th className="p-3">Date</th>
                  <th className="p-3">Reference / Txn ID</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-text-muted text-xs font-mono">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="p-3 font-mono font-medium text-primary">{req.transactionId}</td>
                    <td className="p-3 text-text-primary uppercase text-xs font-semibold">{req.paymentMethod}</td>
                    <td className="p-3 text-right font-bold text-text-primary">
                      Rs. {(req.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : req.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renewal Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-text-primary">Renew Subscription Plan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRenewal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  <option value="JAZZCASH">JazzCash / EasyPaisa</option>
                  <option value="CHEQUE">Corporate Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Renewal Amount (PKR)
                </label>
                <input
                  type="number"
                  readOnly
                  value={form.amount}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm text-text-muted font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Bank Reference / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX-99812401"
                  value={form.transactionId}
                  onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Submit Renewal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

