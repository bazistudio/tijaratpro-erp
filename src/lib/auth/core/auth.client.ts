// /lib/auth/core/auth.client.ts

import axiosInstance, { setStoredToken } from "@/lib/api/axios";
import { AuthUser } from "@/types/auth/auth";
import { AuthSession } from "@/types/auth/session";
import { getDeviceId, setSession, clearSession } from "./auth.session";

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
}

// ─── Cookie helpers (needed so middleware can read the token) ──────────────────

function setTokenCookie(token: string, expiresIn: number) {
  if (typeof document === "undefined") return;
  document.cookie = `token=${token}; path=/; max-age=${expiresIn}; SameSite=Strict`;
}

function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
}

// ─── Main login ───────────────────────────────────────────────────────────────

/**
 * MAIN LOGIN FUNCTION (CORE ENTRY POINT)
 */
export async function loginUser(identifier: string, password: string) {
  const res = await axiosInstance.post("/api/auth/login", {
    identifier,
    password,
    deviceId: getDeviceId(),
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
    accessToken: data.token,
    refreshToken: data.refreshToken || data.token, // fallback for now
    expiresAt,
    deviceId: getDeviceId(),
    user: data.user,
  };

  // 1. store token for axios interceptor
  setStoredToken(data.token);

  // 2. store full session in localStorage
  setSession(session);

  // 3. 🔑 set cookie so Next.js middleware can gate /dashboard
  setTokenCookie(data.token, expiresIn);

  return {
    user: data.user,
    token: data.token,
    session,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * LOGOUT FUNCTION
 */
export function logoutUser() {
  setStoredToken("");
  clearSession();
  clearTokenCookie(); // 🔑 remove cookie so middleware redirects to login
}