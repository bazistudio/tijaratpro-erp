// /lib/auth/core/auth.verify.ts

import { AuthUser } from "@/types/auth/auth";
import { getDeviceId } from "./auth.session";

export interface DecodedToken extends AuthUser {
  exp: number;
  deviceId?: string;
}

/**
 * REAL TOKEN VERIFICATION (replace with JWT library later)
 * For now: safe decode + validation layer
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    if (!token) return null;

    // -----------------------------
    // 1. Decode token payload
    // -----------------------------
    const base64Payload = token.split(".")[1];

    if (!base64Payload) return null;

    const decoded: DecodedToken = JSON.parse(
      Buffer.from(base64Payload, "base64").toString()
    );

    // -----------------------------
    // 2. Check expiry
    // -----------------------------
    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      return null;
    }

    // -----------------------------
    // 3. Device binding check (Electron security)
    // -----------------------------
    const currentDevice = getDeviceId();

    if (decoded.deviceId && decoded.deviceId !== currentDevice) {
      return null;
    }

    // -----------------------------
    // 4. Return clean user object
    // -----------------------------
    const user: AuthUser = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      shopId: decoded.shopId,
      permissions: decoded.permissions,
      createdAt: decoded.createdAt,
      updatedAt: decoded.updatedAt,
    };

    return user;
  } catch (err) {
    return null;
  }
}

/**
 * STRICT GUARD (for API routes)
 */
export function requireAuth(token?: string): AuthUser {
  const user = token ? verifyToken(token) : null;

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * ROLE CHECKER (foundation for RBAC)
 */
export function requireRole(user: AuthUser, roles: AuthUser["role"][]) {
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}

/**
 * SHOP SCOPE CHECK
 */
export function requireShopAccess(user: AuthUser, shopId: string) {
  if (!user.shopId) {
    throw new Error("No shop assigned");
  }

  if (user.shopId !== shopId && user.role !== "SUPER_ADMIN") {
    throw new Error("Shop access denied");
  }
}