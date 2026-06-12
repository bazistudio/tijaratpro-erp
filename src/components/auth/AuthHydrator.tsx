"use client";

// /components/auth/AuthHydrator.tsx
//
// Runs once on app boot (client-side) and rehydrates the Zustand
// auth store from localStorage so a page refresh doesn't wipe
// the user's session.
//
// This is intentionally separate from the middleware (server-side
// cookie check) — both layers must agree for the user to be
// considered authenticated.

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth/core/auth.store";
import { getSession, isSessionValid } from "@/lib/auth/core/auth.session";

export default function AuthHydrator() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const session = getSession();

    if (session && isSessionValid(session)) {
      // Restore store from persisted session
      setAuth(session.user, session);
    } else if (session) {
      // Session exists but expired → clean up
      logout();
    }
    // If no session at all, middleware already handles redirect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // renders nothing
}
