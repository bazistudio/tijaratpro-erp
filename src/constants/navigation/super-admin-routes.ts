import { 
  LayoutDashboard, Building2, Store, UserRoundPlus, History, 
  CreditCard, FileText, CheckCircle, Wallet, List, Tag, 
  ShoppingBag, Package, Tags, Search, Star, BarChart, 
  Shield, Users, ShieldCheck, Key, LogIn, KeyRound, FileWarning, 
  BrainCircuit, Cpu, Database, Receipt, BarChart2, Server, BookOpen, Lock, 
  Settings2, Briefcase, Grid, Flag, Layout, Mail, Bell, Globe, HardDrive, 
  Wrench, ClipboardList, Calendar, Activity, HeartPulse, Save, 
  ChartColumn, TrendingUp, Download, Code2, Webhook, ListTree, ScrollText, TestTube, Info
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface RouteMetadata {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  feature?: string;
  visible: boolean;
}

export interface RouteGroup {
  groupName: string;
  routes: RouteMetadata[];
}

export const SUPER_ADMIN_ROUTES: RouteGroup[] = [
  {
    groupName: 'Overview',
    routes: [
      { id: 'dashboard', title: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard, visible: true }
    ]
  },
  {
    groupName: 'Tenant Management',
    routes: [
      { id: 'organizations', title: 'Organizations', href: '/dashboard/super-admin/tenants/organizations', icon: Building2, visible: true },
      { id: 'shops', title: 'Shops', href: '/dashboard/super-admin/tenants/shops', icon: Store, visible: true },
      { id: 'onboarding', title: 'Onboarding Requests', href: '/dashboard/super-admin/tenants/onboarding', icon: UserRoundPlus, visible: true },
      { id: 'audit-timeline', title: 'Audit Timeline', href: '/dashboard/super-admin/tenants/audit-timeline', icon: History, visible: true }
    ]
  },
  {
    groupName: 'Subscriptions & Billing',
    routes: [
      { id: 'billing-dashboard', title: 'Dashboard', href: '/dashboard/super-admin/billing', icon: LayoutDashboard, visible: true },
      { id: 'billing-plans', title: 'Plans', href: '/dashboard/super-admin/billing/plans', icon: FileText, visible: true },
      { id: 'billing-active', title: 'Active Subscriptions', href: '/dashboard/super-admin/billing/active', icon: CheckCircle, visible: true },
      { id: 'billing-payments', title: 'Payments', href: '/dashboard/super-admin/billing/payments', icon: Wallet, visible: true },
      { id: 'billing-transactions', title: 'Transactions', href: '/dashboard/super-admin/billing/transactions', icon: List, visible: true },
      { id: 'billing-coupons', title: 'Coupons', href: '/dashboard/super-admin/billing/coupons', icon: Tag, visible: true }
    ]
  },
  {
    groupName: 'Marketplace',
    routes: [
      { id: 'market-dashboard', title: 'Dashboard', href: '/dashboard/super-admin/marketplace', icon: LayoutDashboard, visible: true },
      { id: 'market-shops', title: 'Shops', href: '/dashboard/super-admin/marketplace/shops', icon: Store, visible: true },
      { id: 'market-products', title: 'Products', href: '/dashboard/super-admin/marketplace/products', icon: Package, visible: true },
      { id: 'market-categories', title: 'Categories', href: '/dashboard/super-admin/marketplace/categories', icon: Tags, visible: true },
      { id: 'market-search-index', title: 'Search Index', href: '/dashboard/super-admin/marketplace/search-index', icon: Search, visible: true },
      { id: 'market-featured', title: 'Featured Listings', href: '/dashboard/super-admin/marketplace/featured', icon: Star, visible: true },
      { id: 'market-reports', title: 'Reports', href: '/dashboard/super-admin/marketplace/reports', icon: BarChart, visible: true }
    ]
  },
  {
    groupName: 'Users & Security',
    routes: [
      { id: 'security-admins', title: 'Administrators', href: '/dashboard/super-admin/security/administrators', icon: ShieldCheck, visible: true },
      { id: 'security-users', title: 'Users', href: '/dashboard/super-admin/security/users', icon: Users, visible: true },
      { id: 'security-roles', title: 'Roles', href: '/dashboard/super-admin/security/roles', icon: Shield, visible: true },
      { id: 'security-permissions', title: 'Permissions', href: '/dashboard/super-admin/security/permissions', icon: Key, visible: true },
      { id: 'security-sessions', title: 'Sessions', href: '/dashboard/super-admin/security/sessions', icon: LogIn, visible: true },
      { id: 'security-api-keys', title: 'API Keys', href: '/dashboard/super-admin/security/api-keys', icon: KeyRound, visible: true },
      { id: 'security-logs', title: 'Security Logs', href: '/dashboard/super-admin/security/logs', icon: FileWarning, visible: true }
    ]
  },
  {
    groupName: 'AI Center',
    routes: [
      { id: 'ai-dashboard', title: 'Dashboard', href: '/dashboard/super-admin/ai', icon: BrainCircuit, visible: true },
      { id: 'ai-providers', title: 'Providers', href: '/dashboard/super-admin/ai/providers', icon: Cpu, visible: true },
      { id: 'ai-models', title: 'Models', href: '/dashboard/super-admin/ai/models', icon: Database, visible: true },
      { id: 'ai-billing', title: 'AI Billing', href: '/dashboard/super-admin/ai/billing', icon: Receipt, visible: true },
      { id: 'ai-usage', title: 'AI Usage', href: '/dashboard/super-admin/ai/usage', icon: BarChart2, visible: true },
      { id: 'ai-jobs', title: 'AI Jobs', href: '/dashboard/super-admin/ai/jobs', icon: Server, visible: true },
      { id: 'ai-prompts', title: 'Prompt Library', href: '/dashboard/super-admin/ai/prompts', icon: BookOpen, visible: true },
      { id: 'ai-features', title: 'AI Feature Access', href: '/dashboard/super-admin/ai/features', icon: Lock, visible: true }
    ]
  },
  {
    groupName: 'Platform Configuration',
    routes: [
      { id: 'config-general', title: 'General Settings', href: '/dashboard/super-admin/config/general', icon: Settings2, visible: true },
      { id: 'config-business', title: 'Business Types', href: '/dashboard/super-admin/config/business-types', icon: Briefcase, visible: true },
      { id: 'config-modules', title: 'Modules', href: '/dashboard/super-admin/config/modules', icon: Grid, visible: true },
      { id: 'config-features', title: 'Feature Flags', href: '/dashboard/super-admin/config/features', icon: Flag, visible: true },
      { id: 'config-templates', title: 'Templates', href: '/dashboard/super-admin/config/templates', icon: Layout, visible: true },
      { id: 'config-emails', title: 'Email Templates', href: '/dashboard/super-admin/config/emails', icon: Mail, visible: true },
      { id: 'config-notifications', title: 'Notifications', href: '/dashboard/super-admin/config/notifications', icon: Bell, visible: true },
      { id: 'config-localization', title: 'Localization', href: '/dashboard/super-admin/config/localization', icon: Globe, visible: true },
      { id: 'config-storage', title: 'Storage', href: '/dashboard/super-admin/config/storage', icon: HardDrive, visible: true }
    ]
  },
  {
    groupName: 'Operations',
    routes: [
      { id: 'ops-logs', title: 'Audit Logs', href: '/dashboard/super-admin/operations/logs', icon: ClipboardList, visible: true },
      { id: 'ops-jobs', title: 'Background Jobs', href: '/dashboard/super-admin/operations/jobs', icon: Cpu, visible: true },
      { id: 'ops-scheduler', title: 'Scheduler', href: '/dashboard/super-admin/operations/scheduler', icon: Calendar, visible: true },
      { id: 'ops-cache', title: 'Cache', href: '/dashboard/super-admin/operations/cache', icon: Database, visible: true },
      { id: 'ops-monitoring', title: 'Monitoring', href: '/dashboard/super-admin/operations/monitoring', icon: Activity, visible: true },
      { id: 'ops-health', title: 'System Health', href: '/dashboard/super-admin/operations/health', icon: HeartPulse, visible: true },
      { id: 'ops-maintenance', title: 'Maintenance Mode', href: '/dashboard/super-admin/operations/maintenance', icon: Wrench, visible: true },
      { id: 'ops-backups', title: 'Backups', href: '/dashboard/super-admin/operations/backups', icon: Save, visible: true }
    ]
  },
  {
    groupName: 'Reports & Analytics',
    routes: [
      { id: 'reports-revenue', title: 'Revenue', href: '/dashboard/super-admin/reports/revenue', icon: ChartColumn, visible: true },
      { id: 'reports-growth', title: 'Growth', href: '/dashboard/super-admin/reports/growth', icon: TrendingUp, visible: true },
      { id: 'reports-subs', title: 'Subscription Reports', href: '/dashboard/super-admin/reports/subscriptions', icon: FileText, visible: true },
      { id: 'reports-users', title: 'User Reports', href: '/dashboard/super-admin/reports/users', icon: Users, visible: true },
      { id: 'reports-market', title: 'Marketplace Reports', href: '/dashboard/super-admin/reports/marketplace', icon: ShoppingBag, visible: true },
      { id: 'reports-ai', title: 'AI Reports', href: '/dashboard/super-admin/reports/ai', icon: BrainCircuit, visible: true },
      { id: 'reports-export', title: 'Export Center', href: '/dashboard/super-admin/reports/exports', icon: Download, visible: true }
    ]
  },
  {
    groupName: 'Developer Center',
    routes: [
      { id: 'dev-api', title: 'API Explorer', href: '/dashboard/super-admin/developer/api-explorer', icon: Code2, visible: true },
      { id: 'dev-webhooks', title: 'Webhooks', href: '/dashboard/super-admin/developer/webhooks', icon: Webhook, visible: true },
      { id: 'dev-queues', title: 'Queue Inspector', href: '/dashboard/super-admin/developer/queues', icon: ListTree, visible: true },
      { id: 'dev-events', title: 'Event Logs', href: '/dashboard/super-admin/developer/events', icon: ScrollText, visible: true },
      { id: 'dev-testing', title: 'Feature Testing', href: '/dashboard/super-admin/developer/testing', icon: TestTube, visible: true },
      { id: 'dev-system', title: 'System Information', href: '/dashboard/super-admin/developer/system', icon: Info, visible: true }
    ]
  }
];

export const getAllSuperAdminRoutes = (): string[] => {
  return SUPER_ADMIN_ROUTES.flatMap(group => group.routes.map(route => route.href));
};
