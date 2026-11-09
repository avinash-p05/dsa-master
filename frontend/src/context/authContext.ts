import { createContext } from "react";
import type { ApiUser, AuthProviderId, OAuthProviderId } from "@/lib/api";

export type AuthStatus = "loading" | "guest" | "authenticated";
export type AuthDialogMode = "signin" | "signup" | "forgot";

export interface AuthContextValue {
  status: AuthStatus;
  user: ApiUser | null;
  /** Login methods the server offers (empty if the server is unreachable). */
  providers: AuthProviderId[];

  /** Redirects the browser into the OAuth flow. */
  signInWithOAuth: (provider: OAuthProviderId) => void;
  signInAsDev: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  /** Re-read the session from the server (e.g. after verifying an email). */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;

  openAuthDialog: (mode?: AuthDialogMode) => void;
  closeAuthDialog: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
