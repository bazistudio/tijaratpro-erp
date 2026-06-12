"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/lib/auth/core/auth.store";
import { getDeviceId, setSession } from "@/lib/auth/core/auth.session";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type:"success"|"error", text:string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // STEP 1: Register — backend sets tp_token cookie
      await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.mobile,
        shopName: `${formData.name}'s Shop`,
      });

      // STEP 2: Wait for cookie propagation (race protection)
      await new Promise((r) => setTimeout(r, 300));

      // STEP 3: Retry /me up to 3 times (silent re-auth safety)
      let meRes;
      for (let i = 0; i < 3; i++) {
        try {
          meRes = await axios.get("/api/auth/me");
          if (meRes?.data?.data) break;
        } catch {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // STEP 4: Fallback to login if /me still fails
      if (!meRes?.data?.data) {
        setMessage({ type: "success", text: "Account created! Please log in." });
        setTimeout(() => router.push("/auth/login"), 1000);
        return;
      }

      const freshUser = meRes.data.data;

      // STEP 5: Build minimal session (cookie is source of truth, no tokens stored)
      const session = {
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        deviceId: getDeviceId(),
        user: freshUser,
      };

      // STEP 6: Hydrate Zustand + persist session identity
      setSession(session);
      useAuthStore.getState().setAuth(freshUser, session);

      setMessage({ type: "success", text: "Account created! Taking you to your dashboard…" });

      // STEP 7: Go directly to dashboard (cookie already set — middleware will allow)
      setTimeout(() => router.push("/dashboard"), 800);

    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">
            Start managing your shop with TijaratPro
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm"
              placeholder="Bilal Ahmed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="mobile" className="text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              required
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm"
              placeholder="+92 312 3456789"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center flex flex-col gap-2">
          <button
            onClick={() => router.push("/auth/login")}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
