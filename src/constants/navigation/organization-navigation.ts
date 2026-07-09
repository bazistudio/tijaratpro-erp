import { 
  Building, 
  Store, 
  Users, 
  Settings, 
  Activity, 
  PieChart,
  Truck,
  Shield,
  TrendingUp,
  Receipt,
  FileBarChart,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  History,
  Bell,
  CreditCard,
  Sliders,
  Wallet
} from 'lucide-react';
import { PERMISSIONS } from '../permissions';

export const organizationNavigation = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard/organization', icon: Building, permission: PERMISSIONS.ORG_VIEW },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Shops', href: '/dashboard/organization/shops', icon: Store, permission: PERMISSIONS.SHOPS_VIEW_ALL },
      { name: 'Suppliers', href: '/dashboard/organization/suppliers', icon: Truck, permission: PERMISSIONS.SHOPS_VIEW_ALL },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Employees', href: '/dashboard/organization/staff', icon: Users, permission: PERMISSIONS.USERS_VIEW },
      { name: 'Roles & Permissions', href: '/dashboard/organization/roles', icon: Shield, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Sales', href: '/dashboard/organization/sales', icon: TrendingUp, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Expenses', href: '/dashboard/organization/expenses', icon: Receipt, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Reports', href: '/dashboard/organization/reports', icon: FileBarChart, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Revenue Analytics', href: '/dashboard/organization/revenue', icon: PieChart, permission: PERMISSIONS.REPORTS_VIEW_ALL },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { name: 'All Stock', href: '/dashboard/organization/inventory', icon: Package, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Stock Transfers', href: '/dashboard/organization/transfers', icon: ArrowRightLeft, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Low Stock Alerts', href: '/dashboard/organization/alerts', icon: AlertTriangle, permission: PERMISSIONS.REPORTS_VIEW_ALL },
    ],
  },
  {
    label: 'Activity',
    items: [
      { name: 'Audit Logs', href: '/dashboard/organization/audit-logs', icon: Activity, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
      { name: 'Notifications', href: '/dashboard/organization/notifications', icon: Bell, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
      { name: 'Activity History', href: '/dashboard/organization/history', icon: History, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Organization Profile', href: '/dashboard/organization/settings', icon: Settings, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
      { name: 'Business Config', href: '/dashboard/organization/config', icon: Sliders, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
      { name: 'Billing Info', href: '/dashboard/organization/billing', icon: CreditCard, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
    ],
  },
];
