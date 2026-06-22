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
import { bootstrapAuth } from "@/lib/auth/core/auth.bootstrap";

export default function AuthHydrator() {
  useEffect(() => {
    bootstrapAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // renders nothing
}
