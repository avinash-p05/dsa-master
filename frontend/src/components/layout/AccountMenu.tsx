import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

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

const PROVIDER_NAME: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  local: "email",
  dev: "dev login",
};

/** "Sign in" button for guests; avatar menu with sign-out for signed-in users. */
export function AccountMenu() {
  const { status, user, providers, signOut, openAuthDialog } = useAuth();
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

  if (status === "guest") {
    return (
      <button type="button" className="btn btn-primary btn-sm signin-btn" onClick={() => openAuthDialog("signin")}>
        Sign in
      </button>
    );
  }

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    toast("Signed out.");
  };

  const displayName = user?.name || user?.email || "Account";

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="account-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${displayName}`}
        title={displayName}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={displayName} url={user?.avatarUrl ?? null} />
      </button>

      {open && (
        <div className="menu account-menu" role="menu">
          <div className="account-info">
            <strong>{displayName}</strong>
            {user?.email && <span className="muted">{user.email}</span>}
            <span className="muted small">
              Signed in with {PROVIDER_NAME[user?.provider ?? ""] ?? user?.provider} · progress synced
            </span>
          </div>
          <hr />
          <button type="button" role="menuitem" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
