"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const role = "SUPER_ADMIN";

  const goDashboard = () => {
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
  };

  return (
    <div className="p-10">
      <h1>Dashboard Router</h1>

      <button
        onClick={goDashboard}
        className="px-4 py-2 border rounded"
      >
        Continue
      </button>
    </div>
  );
}