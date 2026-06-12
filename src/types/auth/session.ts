import { AuthUser } from "./auth";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;

  expiresAt: number;

  deviceId: string;

  user: AuthUser;
}