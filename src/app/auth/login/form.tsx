
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth/store/auth.store";
import { loginUser } from "@/lib/auth/core/auth.client";
import { LoginFormData } from "@/lib/auth/auth.schema";

const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  setError(null);

  try {
    const { user, token } = await loginUser(
      data.identifier,
      data.password
    );

    setAuth(user, token);

    router.push("/dashboard");
  } catch (err: any) {
    setError(err.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};