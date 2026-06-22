import { AuthSession } from "@/types/auth/session";
import { isElectron } from "@/lib/electron/is-electron";

const SESSION_KEY = "tijarat_session";
const DEVICE_KEY = "tijarat_device_id";
const LAST_EMAIL_KEY = "tijarat_last_email";

/**
 * Save session securely in browser/Electron storage
 */
export async function setSession(session: AuthSession) {
  if (typeof window === "undefined") return;

  if (isElectron()) {
    try {
      await window.electron.auth.setToken(SESSION_KEY, JSON.stringify(session));
    } catch (err) {
      console.error("[Auth] safeStorage set failed", err);
    }
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;

  let data: string | null = null;

  if (isElectron()) {
    try {
      data = await window.electron.auth.getToken(SESSION_KEY);
    } catch (err) {
      console.error("[Auth] safeStorage get failed", err);
    }
  } else {
    data = localStorage.getItem(SESSION_KEY);
  }

  if (!data) return null;

  try {
    return JSON.parse(data) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Clear session (logout)
 */
export async function clearSession() {
  if (typeof window === "undefined") return;

  if (isElectron()) {
    await window.electron.auth.clearToken(SESSION_KEY);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Check if session is valid (expiry check)
 */
export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false;

  return session.expiresAt > Date.now();
}

/**
 * Get device ID (Electron + browser safe)
 */
export async function getDeviceId(): Promise<string> {
  if (typeof window === "undefined") return "server";

  let deviceId: string | null = null;

  if (isElectron()) {
    deviceId = await window.electron.auth.getToken(DEVICE_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await window.electron.auth.setToken(DEVICE_KEY, deviceId);
    }
  } else {
    deviceId = localStorage.getItem(DEVICE_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, deviceId);
    }
  }

  return deviceId;
}

/**
 * Update session expiry (used after refresh)
 */
export async function updateSessionExpiry(expiresAt: number) {
  const session = await getSession();

  if (!session) return;

  const updated: AuthSession = {
    ...session,
    expiresAt,
  };

  await setSession(updated);
}

/**
 * Save the last successfully logged in email
 */
export async function setLastLoginEmail(email: string) {
  if (typeof window === "undefined") return;

  if (isElectron()) {
    try {
      await window.electron.auth.setToken(LAST_EMAIL_KEY, email);
    } catch (err) {
      console.error("[Auth] safeStorage set email failed", err);
    }
  } else {
    localStorage.setItem(LAST_EMAIL_KEY, email);
  }
}

/**
 * Retrieve the last successfully logged in email
 */
export async function getLastLoginEmail(): Promise<string> {
  if (typeof window === "undefined") return "";

  if (isElectron()) {
    try {
      return (await window.electron.auth.getToken(LAST_EMAIL_KEY)) || "";
    } catch (err) {
      console.error("[Auth] safeStorage get email failed", err);
      return "";
    }
  } else {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  }
}