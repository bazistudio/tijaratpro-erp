// /lib/auth/core/auth.bootstrap.ts

import { getSession, isSessionValid } from "./auth.session";
import { getMeUser } from "./auth.client";
import { useAuthStore } from "./auth.store";

export async function bootstrapAuth() {
  const setAuth = useAuthStore.getState().setAuth;
  const logout = useAuthStore.getState().logout;
  const setHydrated = useAuthStore.getState().setHydrated;

  try {
    const session = await getSession();

    if (session && isSessionValid(session)) {
      try {
        // Fetch fresh user data from backend. 
        // Interceptor will attach Bearer token from local storage now!
        const freshUser = await getMeUser();
        setAuth(freshUser, session); // also sets isHydrated: true
      } catch (err) {
        // Backend rejected token (401)
        console.warn("[Auth Bootstrap] Token rejected by backend:", err);
        logout(); 
      }
    } else {
      // No session or expired — clean up stale session
      if (session) {
        console.warn("[Auth Bootstrap] Local session expired");
        logout();
      } else {
        setHydrated(); // no session at all — still mark done
      }
    }
  } catch (error) {
    console.error("[Auth Bootstrap] Critical failure:", error);
    setHydrated();
  }
}
