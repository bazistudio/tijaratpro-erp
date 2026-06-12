import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types/auth/auth";

interface DecodedUser {
  id: string;
  role: UserRole;
  shopId?: string;
  organizationId?: string;
}

// ⚠️ NOTE:
// In real production, replace this with JWT verify
function mockVerifyToken(token: string): DecodedUser | null {
  try {
    // TEMP: decode logic placeholder
    // later we replace with real JWT verification
    const parsed = JSON.parse(Buffer.from(token.split(".")[1] || "", "base64").toString());

    return parsed as DecodedUser;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token =
    req.cookies.get("accessToken")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // ---------------------------
  // 1. PUBLIC ROUTES
  // ---------------------------
  const publicRoutes = ["/login", "/signup", "/"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ---------------------------
  // 2. NO TOKEN → REDIRECT
  // ---------------------------
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = mockVerifyToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ---------------------------
  // 3. ROLE-BASED ROUTES
  // ---------------------------

  // SUPER ADMIN AREA
  if (pathname.startsWith("/admin")) {
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // MULTI ADMIN AREA
  if (pathname.startsWith("/org")) {
    if (!["SUPER_ADMIN", "MULTI_ADMIN"].includes(user.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // SHOP AREA
  if (pathname.startsWith("/shop")) {
    if (!user.shopId) {
      return NextResponse.redirect(new URL("/select-shop", req.url));
    }
  }

  // STAFF AREA (restricted)
  if (pathname.startsWith("/staff")) {
    if (!["SUPER_ADMIN", "MULTI_ADMIN", "SHOP_ADMIN"].includes(user.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // ---------------------------
  // 4. PASS THROUGH
  // ---------------------------
  return NextResponse.next();
}

// ---------------------------
// IMPORTANT: middleware matcher
// ---------------------------
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/org/:path*",
    "/shop/:path*",
    "/staff/:path*",
  ],
};