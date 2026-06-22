// /lib/auth/store/auth.store.ts

import { create } from "zustand";
import { AuthUser } from "@/types/auth/auth";
import { AuthSession } from "@/types/auth/session";
import { setSession, clearSession } from "@/lib/auth/core/auth.session";
import axiosInstance from "@/lib/api/axios";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // true once AuthHydrator has finished its first check
  isBootstrapping: boolean; // true while bootstrap is fetching from network


  // actions
  setAuth: (user: AuthUser, session: AuthSession) => void;
  logout: () => void;        // sync for interceptor hard-logout
  logoutAsync: () => Promise<void>; // async with API call for UI logout
  updateUser: (user: Partial<AuthUser>) => void;
  setHydrated: () => void;   // called by AuthHydrator when done
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isHydrated: false,
  isBootstrapping: true,

  // -------------------------
  // LOGIN / SET AUTH
  // -------------------------
  setAuth: (user, session) => {
    // 1. Persist session in background (fire-and-forget) so UI doesn't block
    setSession(session).catch(console.error);

    // 2. Update state immediately
    set({
      user,
      session,
      isAuthenticated: true,
      isHydrated: true, // hydration complete — user is logged in
      isBootstrapping: false,
    });
  },

  setHydrated: () => set({ isHydrated: true, isBootstrapping: false }),

  // -------------------------
  // LOGOUT (sync — for interceptor hard-logout)
  // -------------------------
  logout: () => {
    // 1. Clear session in background
    clearSession().catch(console.error);
    
    // 2. Update state immediately
    set({ user: null, session: null, isAuthenticated: false, isHydrated: true, isBootstrapping: false });
    // isHydrated: true — hydration is done, we confirmed there's no valid session
  },

  // -------------------------
  // LOGOUT ASYNC — for UI logout button
  // -------------------------
  logoutAsync: async () => {
    const { authLogout } = await import("@/lib/auth/core/auth.client");
    await authLogout();
  },

  // -------------------------
  // UPDATE USER (role/shop changes etc.)
  // -------------------------
  updateUser: (updatedUser) => {
    const current = get().user;

    if (!current) return;

    const newUser = {
      ...current,
      ...updatedUser,
    };

    set({
      user: newUser,
    });
  },
}));