"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/core/auth.store";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      // no user in store — middleware should have caught this,
      // but guard here as a fallback
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
        router.replace("/dashboard/shop-admin");
        break;
      case "STAFF":
        router.replace("/dashboard/staff");
        break;
      default:
        router.replace("/auth/login");
    }
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm animate-pulse">
        Redirecting to your dashboard…
      </p>
    </div>
  );
}