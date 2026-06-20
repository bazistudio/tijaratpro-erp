"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/core/auth.store";
import { loginUser } from "@/lib/auth/core/auth.client";
import type { LoginFormData } from "@/lib/auth/auth.schema";

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, session } = await loginUser(
        formData.identifier,
        formData.password
      );

      // hydrate zustand store
      setAuth(user, session);

      if (user.role === "SUPER_ADMIN") {
        router.push("/dashboard/super-admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="identifier" className="text-sm font-medium text-gray-900">
          Email or Username
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="you@example.com"
          value={formData.identifier}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, identifier: e.target.value }))
          }
          required
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 text-gray-900 bg-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-900">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full pr-16 text-gray-900 bg-white"
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

      {error && (
        <p role="alert" className="text-red-500 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? "Signing in…" : "Sign In"}
      </button>

      <div className="text-center text-sm mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-blue-600 font-medium">
          Create one
        </Link>
      </div>
    </form>
  );
}