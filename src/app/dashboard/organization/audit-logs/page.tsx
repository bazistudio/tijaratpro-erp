'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import axiosInstance from '@/lib/api/axios';
import { 
  ShieldAlert, Search, Filter, Calendar, User, 
  Store, Eye, Loader2, ShieldCheck, RefreshCw, FileText, CheckCircle2 
} from 'lucide-react';

interface AuditLogRecord {
  _id: string;
  action: string;
  resource?: string;
  resourceId?: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  shopId?: string;
  description?: string;
  details?: string | object;
  metadata?: any;
  timestamp?: string;
  createdAt?: string;
}

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const orgId = activeOrganizationId || user?.organizationId;

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/v1/audit-logs', {
        params: { limit: 100 }
      });
      if (res.data?.success && res.data?.data) {
        setLogs(res.data.data);
      } else if (Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err: any) {
      console.warn('Audit logs API call returned default error or mock state fallback:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAuditLogs();
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const desc = (log.description || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const userName = typeof log.userId === 'object' ? (log.userId?.name || '').toLowerCase() : '';
      
      const matchesSearch = 
        !search || 
        desc.includes(search.toLowerCase()) || 
        action.includes(search.toLowerCase()) || 
        userName.includes(search.toLowerCase());

      const matchesAction = 
        actionFilter === 'ALL' || 
        log.action === actionFilter || 
        action.includes(actionFilter.toLowerCase());

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  if (!hasPermission(PERMISSIONS.ORG_SETTINGS_MANAGE) && !hasPermission(PERMISSIONS.SHOPS_MANAGE)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization audit logs. Contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Audit Logs</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Immutable audit trail of security events, administrative changes, and operational activities.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search audit trail by description, user, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Actions</option>
              <option value="STOCK_ADJUSTMENT">Stock Adjustments</option>
              <option value="STOCK_DAMAGE">Stock Damage</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="SETTINGS_UPDATE">Settings Update</option>
              <option value="ROLE_CHANGE">Role & Access Changes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Data Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-text-muted">Loading audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-text-primary">No audit log records found</p>
            <p className="text-sm mt-1">Audit log records will automatically record key operations across shops.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-text-muted text-xs uppercase font-semibold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Resource / Entity</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log, idx) => {
                  const userName = typeof log.userId === 'object' ? log.userId?.name : 'System User';
                  const dateStr = log.timestamp || log.createdAt ? new Date(log.timestamp || log.createdAt!).toLocaleString() : 'Recent';

                  return (
                    <tr key={log._id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-text-muted text-xs whitespace-nowrap font-mono">{dateStr}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                          {log.action || 'ACTIVITY'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-text-primary">{userName || 'Admin'}</td>
                      <td className="p-4 text-text-muted font-mono text-xs">{log.resource || 'System'}</td>
                      <td className="p-4 text-text-primary">{log.description || log.details?.toString() || 'Action executed'}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 hover:bg-surface-hover text-text-muted hover:text-primary rounded-lg transition-colors"
                          title="View Payload Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-text-primary">
                Audit Record ({selectedLog.action})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-text-muted hover:text-text-primary font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-text-muted uppercase font-semibold block">Description</span>
                <p className="text-text-primary font-medium mt-0.5">{selectedLog.description || 'N/A'}</p>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span className="text-xs text-text-muted uppercase font-semibold block mb-1">Metadata Payload</span>
                  <pre className="p-3 bg-muted/40 border border-border rounded-lg text-xs font-mono overflow-x-auto text-text-primary">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

