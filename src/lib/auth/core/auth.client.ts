// /lib/auth/core/auth.client.ts

import axiosInstance, { setStoredToken } from "@/lib/api/axios";
import { AuthUser } from "@/types/auth/auth";
import { AuthSession } from "@/types/auth/session";
import { getDeviceId, setSession } from "./auth.session";

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
}

/**
 * MAIN LOGIN FUNCTION (CORE ENTRY POINT)
 */
export async function loginUser(
  identifier: string,
  password: string
) {
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
  const expiresAt =
    Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 3600 * 1000);

  // build session object
  const session: AuthSession = {
    accessToken: data.token,
    refreshToken: data.refreshToken || data.token, // fallback for now
    expiresAt,
    deviceId: getDeviceId(),
    user: data.user,
  };

  // store token for axios interceptor
  setStoredToken(data.token);

  // store full session
  setSession(session);

  return {
    user: data.user,
    token: data.token,
    session,
  };
}

/**
 * LOGOUT FUNCTION
 */
export function logoutUser() {
  setStoredToken("");
  setSession(null as any);

  if (typeof window !== "undefined") {
    localStorage.removeItem("tijarat_session");
  }
}