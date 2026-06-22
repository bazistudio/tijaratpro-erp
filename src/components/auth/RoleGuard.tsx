"use client";

import { useAuthStore } from "@/lib/auth/core/auth.store";
import { UserRole } from "@/types/auth/auth";
import React from "react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user, isHydrated } = useAuthStore();

  // If we haven't hydrated yet, we can't reliably check roles. 
  // It's safer to show nothing to prevent UI flickering or accidental Access Denied flashes.
  if (!isHydrated) return null;

  // If not logged in, or user's role isn't allowed, show fallback
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Allowed!
  return <>{children}</>;
}
