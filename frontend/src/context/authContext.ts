import { createContext } from "react";
import type { ApiUser, AuthProviderId } from "@/lib/api";

export type AuthStatus = "loading" | "guest" | "authenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: ApiUser | null;
  /** Login providers the server has configured (empty if the server is unreachable). */
  providers: AuthProviderId[];
  signIn: (provider: AuthProviderId) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
