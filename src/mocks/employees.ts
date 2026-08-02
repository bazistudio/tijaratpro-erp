export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  role: string;
  branch: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  pinStatus: 'Enabled' | 'Disabled' | 'Needs Reset';
  joinDate: string;
  lastLogin: string;
}

export const mockEmployees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Ali Khan',
    phone: '+92 300 1234567',
    email: 'ali@tijaratpro.com',
    role: 'Shop Manager',
    branch: 'Main Branch - Lahore',
    status: 'ACTIVE',
    pinStatus: 'Enabled',
    joinDate: '2025-01-15',
    lastLogin: '2026-08-02 08:30 AM',
  },
  {
    id: 'EMP-002',
    name: 'Sara Ahmed',
    phone: '+92 321 7654321',
    email: 'sara@tijaratpro.com',
    role: 'Sales Associate',
    branch: 'Main Branch - Lahore',
    status: 'ACTIVE',
    pinStatus: 'Needs Reset',
    joinDate: '2025-03-22',
    lastLogin: '2026-08-01 06:45 PM',
  },
  {
    id: 'EMP-003',
    name: 'Usman Tariq',
    phone: '+92 333 9998887',
    email: 'usman@tijaratpro.com',
    role: 'Inventory Specialist',
    branch: 'Warehouse 1',
    status: 'DISABLED',
    pinStatus: 'Disabled',
    joinDate: '2025-06-10',
    lastLogin: '2026-07-20 11:15 AM',
  },
  {
    id: 'EMP-004',
    name: 'Tech John',
    phone: '+1 555 0192837',
    email: 'john@tijaratpro.com',
    role: 'Technician',
    branch: 'Repair Center',
    status: 'ACTIVE',
    pinStatus: 'Enabled',
    joinDate: '2025-08-01',
    lastLogin: '2026-08-02 09:10 AM',
  },
];
