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
    expiresAt,
    deviceId: getDeviceId(),
    user: data.user,
  };

  // 1. store full session in localStorage
  setSession(session);

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
  clearSession();
}

/**
 * GET ME (fetch current user via cookie)
 */
export async function getMeUser() {
  const res = await axiosInstance.get("/api/auth/me");
  return res.data.data; // backend returns { success: true, data: { ... } }
}