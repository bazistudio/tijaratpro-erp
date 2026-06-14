import { redirect } from 'next/navigation';
import { AuditPanel } from '@/features/audit/components/AuditPanel';

// Guard: This page is ONLY accessible in development mode.
// In production builds, it redirects to dashboard.
export default function AuditPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/dashboard/shop-admin');
  }

  return (
    <div className="w-full">
      <AuditPanel />
    </div>
  );
}
