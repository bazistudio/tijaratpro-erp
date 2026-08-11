'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import axiosInstance from '@/lib/api/axios';
import toast from 'react-hot-toast';
import { 
  Building2, Save, Globe, Shield, CreditCard, 
  MapPin, Phone, Mail, FileText, CheckCircle2, Loader2, AlertCircle 
} from 'lucide-react';

interface OrgProfileForm {
  name: string;
  code: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  currency: string;
  timezone: string;
}

export default function OrganizationSettingsPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId, setActiveOrganization } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const orgId = activeOrganizationId || user?.organizationId;

  const [form, setForm] = useState<OrgProfileForm>({
    name: '',
    code: '',
    businessType: 'Retail & Wholesale',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationDetails = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/api/v1/organizations/${orgId}`);
      if (res.data?.success && res.data?.data) {
        const org = res.data.data;
        setForm({
          name: org.name || '',
          code: org.code || '',
          businessType: org.businessType || 'Retail & Wholesale',
          email: org.email || user?.email || '',
          phone: org.phone || '',
          address: org.address || '',
          taxNumber: org.taxNumber || '',
          currency: org.currency || 'PKR',
          timezone: org.timezone || 'Asia/Karachi',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organization settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationDetails();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    try {
      setSaving(true);
      const res = await axiosInstance.put(`/api/v1/organizations/${orgId}`, form);
      if (res.data?.success) {
        toast.success('Organization profile updated successfully');
        if (res.data.data) {
          setActiveOrganization(res.data.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update organization profile');
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission(PERMISSIONS.ORG_SETTINGS_MANAGE) && !hasPermission(PERMISSIONS.ORG_EDIT)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to manage organization settings. Contact your organization owner or admin.
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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Profile & Settings</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage overall organization identity, tax details, and regional configurations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">General Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. Acme Superstores"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Organization Code / ID
              </label>
              <input
                type="text"
                disabled
                value={form.code}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm text-text-muted cursor-not-allowed"
              />
              <p className="text-[11px] text-text-muted mt-1">System unique code for your organization.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Business Category / Type
              </label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Retail & Wholesale">Retail & Wholesale</option>
                <option value="Mobile & Electronics">Mobile & Electronics</option>
                <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                <option value="Apparel & Fashion">Apparel & Fashion</option>
                <option value="Supermarket & Grocery">Supermarket & Grocery</option>
                <option value="Services & Repairs">Services & Repairs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Tax Identification (NTN / STRN)
              </label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. 1234567-8"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-text-primary">Contact & Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                placeholder="org@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Primary Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Headquarter Address
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
                placeholder="Full address of organization headquarters..."
              />
            </div>
          </div>
        </div>

        {/* Regional Preferences */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-text-primary">Regional & Currency</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Base Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="PKR">Pakistani Rupee (PKR - Rs.)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
                <option value="AED">UAE Dirham (AED - AED)</option>
                <option value="SAR">Saudi Riyal (SAR - SAR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Asia/Karachi">Karachi (GMT+5:00)</option>
                <option value="Asia/Dubai">Dubai (GMT+4:00)</option>
                <option value="Asia/Riyadh">Riyadh (GMT+3:00)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Organization Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

