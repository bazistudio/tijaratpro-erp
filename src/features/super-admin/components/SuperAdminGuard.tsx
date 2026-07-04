'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/core/auth.store';

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-1 h-full w-full min-h-0 items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
