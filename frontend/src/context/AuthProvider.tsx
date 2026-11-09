import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/useToast";
import { api, oauthLoginUrl, type ApiUser, type AuthProviderId } from "@/lib/api";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [providers, setProviders] = useState<AuthProviderId[]>([]);

  const refresh = useCallback(async () => {
    try {
      const session = await api.session();
      setProviders(session.providers);
      setUser(session.user);
      setStatus(session.authenticated ? "authenticated" : "guest");
    } catch {
      // No backend (e.g. a static-only deploy): the app keeps working in guest mode.
      setProviders([]);
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Spring redirects to /?login=error when the OAuth flow fails.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "error") {
      toast("Sign-in didn't complete. Please try again.");
      params.delete("login");
      const query = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
    }
  }, [toast]);

  const signIn = useCallback(
    async (provider: AuthProviderId) => {
      if (provider === "dev") {
        await api.devLogin();
        await refresh();
        return;
      }
      window.location.assign(oauthLoginUrl(provider));
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      await refresh();
    }
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, providers, signIn, signOut }),
    [status, user, providers, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
