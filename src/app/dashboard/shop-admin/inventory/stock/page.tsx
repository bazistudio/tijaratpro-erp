'use client';

import React, { useState } from 'react';
import { Package, AlertTriangle, XCircle, ArrowRightLeft, PenTool, Search, Filter, MoreHorizontal, History, Edit, Eye, Trash2 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KpiCard } from '@/features/settings/components/KpiCard';
import { DataTable, TableColumn } from '@/components/common/DataTable';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';

import {
  dummyUpdateStock,
  dummyRestock,
  dummyLowStock,
  dummyDamagedStock,
  dummyReplacement,
  UpdateStockRecord,
  RestockRecord,
  LowStockRecord,
  DamagedStockRecord,
  ReplacementRecord
} from './dummyData';

type TabId = 'update' | 'restock' | 'low-stock' | 'damaged' | 'replacement';

export default function InventoryOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('update');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'update', label: 'Update Stock' },
    { id: 'restock', label: 'Restock' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'damaged', label: 'Damaged Stock' },
    { id: 'replacement', label: 'Replacement & Warranty' },
  ];

  const handleAction = (record: any, action: string) => {
    setSelectedRecord({ ...record, _action: action });
    setIsDrawerOpen(true);
  };

  const renderActionMenu = (row: any) => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleAction(row, 'view')} className="text-text-muted hover:text-primary transition-colors" title="View"><Eye className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'edit')} className="text-text-muted hover:text-primary transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'history')} className="text-text-muted hover:text-primary transition-colors" title="History"><History className="h-4 w-4" /></button>
    </div>
  );

  const updateColumns: TableColumn<UpdateStockRecord>[] = [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'adjustmentType', label: 'Type' },
    { key: 'quantity', label: 'Adj. Qty', render: (row) => (
      <span className={row.quantity > 0 ? 'text-success' : 'text-danger'}>{row.quantity > 0 ? '+' : ''}{row.quantity}</span>
    )},
    { key: 'reason', label: 'Reason' },
    { key: 'updatedBy', label: 'Updated By' },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'Approved' ? 'success' : 'warning'}>{row.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  const restockColumns: TableColumn<RestockRecord>[] = [
    { key: 'product', label: 'Product' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'currentQty', label: 'Current Qty' },
    { key: 'minQty', label: 'Min Qty' },
    { key: 'recommendedQty', label: 'Rec. Qty' },
    { key: 'orderQty', label: 'Order Qty' },
    { key: 'expectedArrival', label: 'Expected' },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'Received' ? 'success' : row.status === 'In Transit' ? 'info' : 'warning'}>{row.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  const lowStockColumns: TableColumn<LowStockRecord>[] = [
    { key: 'product', label: 'Product' },
    { key: 'currentQty', label: 'Current Qty' },
    { key: 'minQty', label: 'Min Qty' },
    { key: 'difference', label: 'Diff', render: (row) => <span className="text-danger">{row.difference}</span> },
    { key: 'daysRemaining', label: 'Est. Days Left' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'priority', label: 'Priority', render: (row) => (
      <Badge variant={row.priority === 'Healthy' ? 'success' : row.priority === 'Warning' ? 'warning' : 'danger'}>{row.priority}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  const damagedColumns: TableColumn<DamagedStockRecord>[] = [
    { key: 'product', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    { key: 'damageType', label: 'Damage Type' },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'decision', label: 'Decision' },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'Pending Review' ? 'warning' : 'info'}>{row.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  const replacementColumns: TableColumn<ReplacementRecord>[] = [
    { key: 'id', label: 'Rep ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'product', label: 'Product' },
    { key: 'reason', label: 'Reason' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'approval', label: 'Approval', render: (row) => (
      <Badge variant={row.approval === 'Approved' ? 'success' : row.approval === 'Rejected' ? 'danger' : 'warning'}>{row.approval}</Badge>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'Closed' ? 'success' : 'neutral'}>{row.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title="Inventory Operations" 
        breadcrumbs={[
          { label: 'Inventory', href: '/dashboard/shop-admin/inventory' },
          { label: 'Operations' }
        ]} 
      />

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KpiCard label="Total Products" value="1,248" icon={<Package />} trend={{ direction: 'up', value: '12%' }} variant="default" />
          <KpiCard label="Total Stock Qty" value="15,420" icon={<Package />} variant="default" />
          <KpiCard label="Low Stock Items" value="24" icon={<AlertTriangle />} trend={{ direction: 'down', value: '3%' }} variant="warning" />
          <KpiCard label="Damaged Items" value="8" icon={<XCircle />} variant="danger" />
          <KpiCard label="Pending Replacements" value="5" icon={<ArrowRightLeft />} trend={{ direction: 'up', value: '1' }} variant="info" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>+ Update Stock</Button>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>+ Receive Restock</Button>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>+ Report Damage</Button>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>+ Create Replacement</Button>
          <div className="flex-1" />
          <Button variant="outline">Export</Button>
          <Button variant="outline">Print</Button>
        </div>

        {/* Workspace Container */}
        <div className="bg-surface rounded-xl border border-border flex flex-col min-h-[500px]">
          
          {/* Tabs Navigation */}
          <div className="flex px-4 pt-2 border-b border-border overflow-x-auto hide-scrollbar bg-surface-hover/50 rounded-t-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <TableToolbar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              searchPlaceholder={`Search ${tabs.find(t => t.id === activeTab)?.label}...`}
              onFilterClick={() => console.log('Filters')}
              onExportClick={() => console.log('Export')}
              onRefreshClick={() => console.log('Refresh')}
              hasBulkActions={true}
              onBulkActionClick={() => console.log('Bulk')}
            />

            <div className="flex-1 min-h-[300px]">
              {activeTab === 'update' && <DataTable columns={updateColumns} data={dummyUpdateStock} />}
              {activeTab === 'restock' && <DataTable columns={restockColumns} data={dummyRestock} />}
              {activeTab === 'low-stock' && <DataTable columns={lowStockColumns} data={dummyLowStock} />}
              {activeTab === 'damaged' && <DataTable columns={damagedColumns} data={dummyDamagedStock} />}
              {activeTab === 'replacement' && <DataTable columns={replacementColumns} data={dummyReplacement} />}
            </div>
          </div>
        </div>
      </div>

      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedRecord ? `${selectedRecord._action === 'view' ? 'View' : 'Edit'} Record` : 'Details'}
      >
        {selectedRecord && (
          <div className="flex flex-col h-full">
            {/* Drawer Header/Info Card */}
            <div className="bg-surface-hover p-4 rounded-lg mb-6 border border-border">
              <h3 className="font-semibold text-lg">{selectedRecord.product}</h3>
              <p className="text-sm text-text-muted">ID: {selectedRecord.id}</p>
            </div>

            {/* Form Fields Stub */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted">Status</label>
                  <p className="text-sm">{selectedRecord.status}</p>
                </div>
                {selectedRecord.quantity !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-text-muted">Quantity</label>
                    <p className="text-sm">{selectedRecord.quantity}</p>
                  </div>
                )}
                {selectedRecord.supplier && (
                  <div>
                    <label className="text-xs font-medium text-text-muted">Supplier</label>
                    <p className="text-sm">{selectedRecord.supplier}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border">
                <label className="text-xs font-medium text-text-muted mb-2 block">Notes</label>
                <textarea 
                  className="w-full p-2 border border-border rounded-md bg-surface text-sm focus:ring-1 focus:ring-primary outline-none" 
                  rows={4} 
                  placeholder="Add reference notes here..."
                  defaultValue={selectedRecord.reason || selectedRecord.damageType || ''}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border mt-auto flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDrawerOpen(false)}>Save Changes</Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
