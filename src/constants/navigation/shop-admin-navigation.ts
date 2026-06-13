import {
  LayoutDashboard,
  MonitorPlay,
  Tags,
  Layers,
  Truck,
  Users,
  Wrench,
  History,
  Receipt,
  Settings,
} from 'lucide-react';
import { NavigationGroup } from '../../types/navigation';

export const shopAdminNavigation: NavigationGroup[] = [
  {
    items: [
      { name: 'Dashboard', href: '/dashboard/shop-admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Sales',
    items: [
      { name: 'POS', href: '/dashboard/shop-admin/pos', icon: MonitorPlay },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { name: 'Products', href: '/dashboard/shop-admin/products', icon: Tags },
      { name: 'Stock', href: '/dashboard/shop-admin/stock', icon: Layers },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Customers', href: '/dashboard/shop-admin/customers', icon: Users },
      { name: 'Suppliers', href: '/dashboard/shop-admin/suppliers', icon: Truck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Repairs', href: '/dashboard/shop-admin/repairs', icon: Wrench },
      { name: 'Expenses', href: '/dashboard/shop-admin/expenses', icon: Receipt },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'History', href: '/dashboard/shop-admin/history', icon: History },
    ],
  },
  {
    items: [
      { name: 'Settings', href: '/dashboard/shop-admin/settings', icon: Settings },
    ],
  },
];
