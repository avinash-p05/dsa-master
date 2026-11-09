import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { AuthProviderId } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

const PROVIDER_LABEL: Record<AuthProviderId, string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
  dev: "Continue as dev user",
};

/** Sign-in buttons for every provider the server offers. */
export function SignInButtons({ onDone }: { onDone?: () => void }) {
  const { providers, signIn } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState<AuthProviderId | null>(null);

  const handle = async (provider: AuthProviderId) => {
    setBusy(provider);
    try {
      await signIn(provider);
      onDone?.();
    } catch {
      toast("Sign-in failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="signin-buttons">
      {providers.map((p) => (
        <button key={p} type="button" className={`btn provider-btn ${p}`} disabled={busy !== null} onClick={() => handle(p)}>
          {p !== "dev" && <Icon name={p} className="provider-icon" />}
          {busy === p ? "Signing in…" : PROVIDER_LABEL[p]}
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return <img className="avatar" src={url} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  }
  return (
    <span className="avatar avatar-fallback" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function AccountMenu() {
  const { status, user, providers, signOut } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // No backend available (or still checking): stay in local-only mode quietly.
  if (status === "loading" || (status === "guest" && providers.length === 0)) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    toast("Signed out.");
  };

  const displayName = user?.name || user?.email || "Account";

  return (
    <div className="menu-wrap" ref={wrapRef}>
      {status === "authenticated" ? (
        <button
          type="button"
          className="account-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          title={displayName}
          onClick={() => setOpen((o) => !o)}
        >
          <Avatar name={displayName} url={user?.avatarUrl ?? null} />
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Sign in
        </button>
      )}

      {open && (
        <div className="menu account-menu" role="menu">
          {status === "authenticated" ? (
            <>
              <div className="account-info">
                <strong>{displayName}</strong>
                {user?.email && <span className="muted">{user.email}</span>}
                <span className="muted small">Progress synced to your account</span>
              </div>
              <hr />
              <button type="button" role="menuitem" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <div className="signin-panel">
              <strong>Save your progress</strong>
              <p className="muted small">Sign in to keep your progress across browsers and devices.</p>
              <SignInButtons onDone={() => setOpen(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
