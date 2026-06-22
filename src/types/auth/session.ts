import { AuthUser } from "./auth";

export interface AuthSession {
  token: string;
  expiresAt: number;
  deviceId: string;
  user: AuthUser;
}