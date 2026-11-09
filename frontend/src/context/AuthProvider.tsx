import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useToast } from "@/hooks/useToast";
import { api, oauthLoginUrl, type ApiUser, type AuthProviderId, type OAuthProviderId } from "@/lib/api";
import { AuthContext, type AuthContextValue, type AuthDialogMode, type AuthStatus } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [providers, setProviders] = useState<AuthProviderId[]>([]);
  const [dialogMode, setDialogMode] = useState<AuthDialogMode | null>(null);

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

  const signInWithOAuth = useCallback((provider: OAuthProviderId) => {
    window.location.assign(oauthLoginUrl(provider));
  }, []);

  const signInAsDev = useCallback(async () => {
    await api.devLogin();
    await refresh();
  }, [refresh]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      await api.login({ email, password });
      await refresh();
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

  const openAuthDialog = useCallback((mode: AuthDialogMode = "signin") => setDialogMode(mode), []);
  const closeAuthDialog = useCallback(() => setDialogMode(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      providers,
      signInWithOAuth,
      signInAsDev,
      signInWithPassword,
      refresh,
      signOut,
      openAuthDialog,
      closeAuthDialog,
    }),
    [status, user, providers, signInWithOAuth, signInAsDev, signInWithPassword, refresh, signOut, openAuthDialog, closeAuthDialog],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {dialogMode && <AuthDialog initialMode={dialogMode} onClose={closeAuthDialog} />}
    </AuthContext.Provider>
  );
}
