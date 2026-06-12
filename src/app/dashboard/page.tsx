"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const role = "SUPER_ADMIN";

  useEffect(() => {
    switch (role) {
      case "SUPER_ADMIN":
        router.push("/dashboard/super-admin");
        break;

      case "MULTI_ADMIN":
        router.push("/dashboard/multi-admin");
        break;

      case "SHOP_ADMIN":
        router.push("/dashboard/shop-admin");
        break;

      case "STAFF":
        router.push("/dashboard/staff");
        break;
    }
  }, [router]);

  return (
    <div className="p-10">
      <h1>Redirecting to dashboard...</h1>
    </div>
  );
}