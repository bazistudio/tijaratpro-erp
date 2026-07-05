import { 
  Building, 
  Store, 
  Users, 
  Settings, 
  Activity, 
  PieChart 
} from 'lucide-react';
import { PERMISSIONS } from '../permissions';

export const organizationNavigation = [
  {
    group: 'Organization',
    items: [
      { name: 'Dashboard', href: '/dashboard/organization', icon: Building, permission: PERMISSIONS.ORG_VIEW },
      { name: 'Shops', href: '/dashboard/organization/shops', icon: Store, permission: PERMISSIONS.SHOPS_VIEW_ALL },
      { name: 'Staff', href: '/dashboard/organization/staff', icon: Users, permission: PERMISSIONS.USERS_VIEW },
      { name: 'Reports', href: '/dashboard/organization/reports', icon: PieChart, permission: PERMISSIONS.REPORTS_VIEW_ALL },
      { name: 'Audit Logs', href: '/dashboard/organization/audit-logs', icon: Activity, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
      { name: 'Settings', href: '/dashboard/organization/settings', icon: Settings, permission: PERMISSIONS.ORG_SETTINGS_MANAGE },
    ],
  },
];
