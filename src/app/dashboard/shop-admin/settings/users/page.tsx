'use client';

import React, { useState } from 'react';
import { Users, UserCheck, UserX, Mail, Activity, Eye, Edit, MapPin, Key, Ban, Trash2 } from 'lucide-react';
import { KpiCard } from '@/features/settings/components/KpiCard';
import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { DataTable, TableColumn } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { mockEmployees, Employee } from '@/mocks/employees';

// Mock Invitations
const mockInvitations = [
  { id: 'INV-01', email: 'ahmed@tijaratpro.com', role: 'Sales Associate', branch: 'Main Branch', status: 'Pending', sentDate: '2026-08-01' },
];

// Mock Activity
const mockActivity = [
  { id: 1, time: '2026-08-02 08:30 AM', message: 'Ali Khan logged into POS' },
  { id: 2, time: '2026-08-02 09:15 AM', message: 'Tech John updated inventory for iPhone 13 Battery' },
  { id: 3, time: '2026-08-01 06:45 PM', message: 'Sara Ahmed created sale invoice #ORD-00045' },
];

export default function WorkforcePage() {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');

  const handleAction = (employee: Employee, mode: 'view' | 'edit' | 'branch' | 'pin' | 'disable' | 'delete' | 'activity') => {
    if (mode === 'view' || mode === 'edit') {
      setSelectedEmployee(employee);
      setDrawerMode(mode);
      setIsDrawerOpen(true);
    } else {
      console.log(`Action ${mode} triggered for ${employee.name}`);
    }
  };

  const renderActionMenu = (row: Employee) => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleAction(row, 'view')} className="text-text-muted hover:text-primary transition-colors" title="View Profile"><Eye className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'edit')} className="text-text-muted hover:text-primary transition-colors" title="Edit Profile"><Edit className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'branch')} className="text-text-muted hover:text-primary transition-colors" title="Change Branch"><MapPin className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'pin')} className="text-text-muted hover:text-primary transition-colors" title="Reset PIN"><Key className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'disable')} className="text-text-muted hover:text-warning transition-colors" title="Disable Account"><Ban className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'activity')} className="text-text-muted hover:text-info transition-colors" title="View Activity"><Activity className="h-4 w-4" /></button>
      <button onClick={() => handleAction(row, 'delete')} className="text-text-muted hover:text-danger transition-colors" title="Soft Delete"><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  const employeeColumns: TableColumn<Employee>[] = [
    { key: 'name', label: 'Employee', render: (row) => (
      <div>
        <div className="font-medium text-text-primary">{row.name}</div>
        <div className="text-xs text-text-muted">{row.email}</div>
      </div>
    )},
    { key: 'role', label: 'Role' },
    { key: 'branch', label: 'Branch' },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'ACTIVE' ? 'success' : row.status === 'DISABLED' ? 'danger' : 'warning'}>{row.status}</Badge>
    )},
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'actions', label: 'Actions', render: renderActionMenu },
  ];

  const invitationColumns: TableColumn<any>[] = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'branch', label: 'Branch' },
    { key: 'sentDate', label: 'Sent Date' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant="warning">{row.status}</Badge> },
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Resend</Button>
        <Button variant="outline" size="sm" className="text-danger border-danger/50 hover:bg-danger/10">Cancel</Button>
      </div>
    )}
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)', opacity: 0.12 }}
          >
            <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Workforce</h1>
            <p className="text-sm text-text-muted">
              Manage employees, invitations, and view workforce activity
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Employees" value={employees.length.toString()} icon={<Users />} variant="default" />
        <KpiCard label="Active Employees" value={employees.filter(e => e.status === 'ACTIVE').length.toString()} icon={<UserCheck />} variant="success" />
        <KpiCard label="Inactive Employees" value={employees.filter(e => e.status === 'DISABLED').length.toString()} icon={<UserX />} variant="warning" />
        <KpiCard label="Pending Invitations" value={mockInvitations.length.toString()} icon={<Mail />} variant="info" />
      </div>

      {/* Section 2: Employee Management Table */}
      <SettingsCard
        title="Employee Directory"
        description="Manage active and inactive employees across all branches"
        icon={<Users className="w-5 h-5" />}
      >
        <div className="h-[400px]">
          <DataTable columns={employeeColumns} data={employees} />
        </div>
      </SettingsCard>

      {/* Section 3: Employee Invitations */}
      <SettingsCard
        title="Employee Invitations"
        description="Pending invitations sent to new staff"
        icon={<Mail className="w-5 h-5" />}
      >
        <div className="flex justify-end mb-4">
          <Button variant="primary">Invite Employee</Button>
        </div>
        <div className="h-[200px]">
          <DataTable columns={invitationColumns} data={mockInvitations} />
        </div>
      </SettingsCard>

      {/* Section 4: Workforce Activity Log */}
      <SettingsCard
        title="Workforce Activity"
        description="Recent logins, POS actions, and important events"
        icon={<Activity className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {mockActivity.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-surface-hover rounded-lg border border-border">
              <div className="mt-1">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-text-muted">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Employee Drawer */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'view' ? 'Employee Profile' : 'Edit Employee'}
      >
        {selectedEmployee && (
          <div className="flex flex-col h-full space-y-6">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                <Badge variant={selectedEmployee.status === 'ACTIVE' ? 'success' : 'danger'}>{selectedEmployee.status}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted">Full Name</label>
                {drawerMode === 'edit' ? (
                  <input type="text" defaultValue={selectedEmployee.name} className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-surface" />
                ) : (
                  <p className="text-sm font-medium">{selectedEmployee.name}</p>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-text-muted">Phone Number</label>
                {drawerMode === 'edit' ? (
                  <input type="text" defaultValue={selectedEmployee.phone} className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-surface" />
                ) : (
                  <p className="text-sm font-medium">{selectedEmployee.phone}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">Email Address</label>
                {drawerMode === 'edit' ? (
                  <input type="email" defaultValue={selectedEmployee.email} className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-surface" />
                ) : (
                  <p className="text-sm font-medium">{selectedEmployee.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">Assigned Branch</label>
                <p className="text-sm font-medium">{selectedEmployee.branch}</p>
              </div>

              <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
                <label className="text-xs font-medium text-warning">Assigned Role</label>
                <p className="text-sm font-bold mt-1 mb-3">{selectedEmployee.role}</p>
                <a href="/dashboard/shop-admin/settings/roles" className="text-xs bg-surface border border-border px-3 py-1.5 rounded shadow-sm hover:bg-surface-hover transition-colors font-medium">
                  Manage Role & Permissions
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="text-xs font-medium text-text-muted">PIN Status</label>
                  <p className="text-sm font-medium">{selectedEmployee.pinStatus}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Join Date</label>
                  <p className="text-sm font-medium">{selectedEmployee.joinDate}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Last Login</label>
                  <p className="text-sm font-medium">{selectedEmployee.lastLogin}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Close</Button>
              {drawerMode === 'edit' && <Button variant="primary" onClick={() => setIsDrawerOpen(false)}>Save Changes</Button>}
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}