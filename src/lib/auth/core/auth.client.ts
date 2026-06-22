// /lib/auth/core/auth.client.ts

import axiosInstance from "@/lib/api/axios";
import { AuthUser } from "@/types/auth/auth";
import { AuthSession } from "@/types/auth/session";
import { getDeviceId, setSession, clearSession } from "./auth.session";

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
}

// cookie logic removed since backend handles tp_token

// ─── Main login ───────────────────────────────────────────────────────────────

/**
 * MAIN LOGIN FUNCTION (CORE ENTRY POINT)
 */
export async function loginUser(identifier: string, password: string) {
  const deviceId = await getDeviceId();
  const res = await axiosInstance.post("/api/auth/login", {
    identifier,
    password,
    deviceId,
  });

  const data: LoginResponse = res.data;

  if (!data?.token || !data?.user) {
    throw new Error("Invalid login response");
  }

  // default expiry (fallback: 1 hour)
  const expiresIn = data.expiresIn ?? 3600;
  const expiresAt = Date.now() + expiresIn * 1000;

  // build session object
  const session: AuthSession = {
    token: data.token,
    expiresAt,
    deviceId,
    user: data.user,
  };

  // 1. store full session in storage (fire-and-forget so UI doesn't block on disk IO)
  setSession(session).catch(console.error);

  return {
    user: data.user,
    token: data.token,
    session,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * LOGOUT FUNCTION (Single Source of Truth)
 */
export async function authLogout() {
  try {
    await axiosInstance.post("/api/auth/logout");
  } catch { /* ignore API errors on logout */ }
  
  clearSession().catch(console.error);
  
  const { useAuthStore } = await import("./auth.store");
  useAuthStore.getState().logout(); // sync update
  
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}

/**
 * GET ME (fetch current user via cookie)
 */
export async function getMeUser() {
  const res = await axiosInstance.get("/api/auth/me");
  return res.data.data; // backend returns { success: true, data: { ... } }
}