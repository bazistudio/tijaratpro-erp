import axiosInstance from "./axios";
import { getAccessToken, updateSessionTokens, clearSession } from "@/lib/auth/core/auth.session";
import { logoutUser } from "@/lib/auth/core/auth.client";

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches access token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Handles auth failures globally
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ---------------------------
    // 1. HANDLE 401 UNAUTHORIZED
    // ---------------------------
    if (error.response?.status === 401) {
      try {
        /**
         * FUTURE UPGRADE:
         * Here we will call refresh token API
         * and retry original request
         */

        const sessionError = error.response?.data?.message;

        // If token invalid → logout safely
        logoutUser();
        clearSession();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      } catch (err) {
        logoutUser();
        clearSession();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);