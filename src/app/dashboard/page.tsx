"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/core/auth.store";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    // Wait for AuthHydrator to finish — prevents flash redirect to login
    if (!isHydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    switch (user.role) {
      case "SUPER_ADMIN":
        router.replace("/dashboard/super-admin");
        break;
      case "MULTI_ADMIN":
        router.replace("/dashboard/multi-admin");
        break;
      case "SHOP_ADMIN":
      case "OWNER":
      case "ADMIN": // backend default registration role — maps to shop-admin view
        router.replace("/dashboard/shop-admin");
        break;
      case "STAFF":
        router.replace("/dashboard/staff");
        break;
      default:
        router.replace("/auth/login");
    }
  }, [router, user, isHydrated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm animate-pulse">
        Redirecting to your dashboard…
      </p>
    </div>
  );
}