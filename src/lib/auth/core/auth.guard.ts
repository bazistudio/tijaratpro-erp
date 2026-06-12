import { AuthUser } from "./auth.types";
import { verifyToken } from "./auth.verify";

export function requireAuth(req: any): AuthUser {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) throw new Error("Unauthorized");

  const user = verifyToken(token);

  if (!user) throw new Error("Invalid token");

  return user;
}