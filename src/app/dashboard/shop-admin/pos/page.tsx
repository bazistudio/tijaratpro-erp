"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function POSPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sale");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-gray-500 font-medium animate-pulse">
        Opening Point of Sale...
      </div>
    </div>
  );
}
