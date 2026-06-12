// /lib/auth/store/auth.store.ts

import { create } from "zustand";
import { AuthUser } from "@/types/auth/auth";
import { AuthSession } from "@/types/auth/session";
import { setSession, clearSession } from "@/lib/auth/core/auth.session";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;

  // actions
  setAuth: (user: AuthUser, session: AuthSession) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,

  // -------------------------
  // LOGIN / SET AUTH
  // -------------------------
  setAuth: (user, session) => {
    setSession(session); // persist session

    set({
      user,
      session,
      isAuthenticated: true,
    });
  },

  // -------------------------
  // LOGOUT
  // -------------------------
  logout: () => {
    clearSession();

    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
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