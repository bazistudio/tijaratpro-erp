"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/lib/auth/core/auth.store";
import { getDeviceId, setSession } from "@/lib/auth/core/auth.session";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    mobile: "",
    password: "",
    accountType: "SINGLE_SHOP",
    businessType: "RETAIL",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type:"success"|"error", text:string} | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
      // STEP 1: Register — no auto login
      await axios.post("/api/auth/signup", {
        ownerName: formData.ownerName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        businessName: formData.businessName,
        accountType: formData.accountType,
        businessType: formData.businessType,
      });

      setIsSuccess(true);
      setMessage({ type: "success", text: "Your registration request has been submitted successfully.\n\nYour account is currently pending Super Admin approval.\n\nYou will be able to sign in after your request has been approved." });

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Registration</h1>
          <p className="text-sm text-gray-500">
            Start managing your business with TijaratPro
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm whitespace-pre-wrap ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {isSuccess ? (
          <div className="mt-6 text-center flex flex-col gap-2">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessName" className="text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              value={formData.businessName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm text-gray-900 bg-white"
              placeholder="Al Aziz Mobile Parts"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
              Owner Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              required
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm text-gray-900 bg-white"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm text-gray-900 bg-white"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm text-gray-900 bg-white"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm pr-10 text-gray-900 bg-white"
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="accountType" className="text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm bg-white text-gray-900"
            >
              <option value="SINGLE_SHOP">Single Shop</option>
              <option value="ORGANIZATION">Organization (Multi-Shop)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessType" className="text-sm font-medium text-gray-700">
              Business Category
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-sm bg-white text-gray-900"
            >
              <option value="RETAIL">Retail</option>
              <option value="MEDICAL">Medical</option>
              <option value="AUTO">Auto Workshop</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="SALON">Salon</option>
              <option value="MANUFACTURING">Manufacturing</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? "Registering..." : "Submit Registration"}
          </button>
        </form>
        )}

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
