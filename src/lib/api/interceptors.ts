import axiosInstance from "./axios";
import { clearSession } from "@/lib/auth/core/auth.session";
import toast from "react-hot-toast";

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach device ID header for POS session tracking
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[DEBUG] AXIOS REQUEST interceptor:", config.baseURL, config.url);
    // tp_token cookie sent automatically via withCredentials: true
    // Attach device ID for POS terminal tracking (key matches auth.session.ts)
    if (typeof window !== "undefined") {
      const deviceId = localStorage.getItem("tijarat_device_id");
      if (deviceId) {
        config.headers["x-device-id"] = deviceId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// On 401: session is definitively expired — clear local state and redirect.
// We use a 7-day httpOnly cookie; no separate refresh token exists yet.
// When real refresh tokens are added, this is the only place to update.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearSession();

      // Lazy import to avoid circular dependency at module load time
      const { useAuthStore } = await import("@/lib/auth/core/auth.store");
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } else {
      // Global API Error Handler
      const errorMessage = error.response?.data?.message || error.message || "An unexpected network error occurred";
      
      // Stop silent failures
      console.error("[API Error]", errorMessage);
      if (typeof window !== "undefined") {
        toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

