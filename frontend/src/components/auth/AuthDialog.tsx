import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ApiError, api, errorMessage, type OAuthProviderId } from "@/lib/api";
import type { AuthDialogMode } from "@/context/authContext";
import { Icon } from "@/components/ui/Icon";

type View =
  | { kind: AuthDialogMode }
  | { kind: "sent"; email: string; purpose: "verify" | "reset" }
  | { kind: "unverified"; email: string };

const MIN_PASSWORD = 8;

const OAUTH_LABEL: Record<OAuthProviderId, string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

/** Modal for every sign-in path: OAuth, email/password sign-in/up and "forgot password". */
export function AuthDialog({ initialMode, onClose }: { initialMode: AuthDialogMode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { providers, signInWithOAuth, signInAsDev, signInWithPassword } = useAuth();
  const toast = useToast();

  const [view, setView] = useState<View>({ kind: initialMode });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauth = providers.filter((p): p is OAuthProviderId => p === "github" || p === "google");
  const passwordEnabled = providers.includes("password");
  const devEnabled = providers.includes("dev");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const go = (next: View) => {
    setError(null);
    setView(next);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        go({ kind: "unverified", email });
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await signInWithPassword(email.trim(), password);
      toast("Signed in.");
      onClose();
    });
  };

  const onSignUp = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    void run(async () => {
      await api.register({ email: email.trim(), password, name: name.trim() || undefined });
      go({ kind: "sent", email: email.trim(), purpose: "verify" });
    });
  };

  const onForgot = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await api.forgotPassword(email.trim());
      go({ kind: "sent", email: email.trim(), purpose: "reset" });
    });
  };

  const resendVerification = (address: string) =>
    run(async () => {
      await api.resendVerification(address);
      go({ kind: "sent", email: address, purpose: "verify" });
      toast("Verification email sent.");
    });

  const title =
    view.kind === "signup"
      ? "Create your account"
      : view.kind === "forgot"
        ? "Reset your password"
        : view.kind === "sent"
          ? "Check your email"
          : view.kind === "unverified"
            ? "Verify your email"
            : "Sign in to DSA Master";

  const showProviders = view.kind === "signin" || view.kind === "signup";

  return (
    <dialog
      ref={ref}
      className="auth-dialog"
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <div className="auth-body">
        <button type="button" className="icon-btn auth-close" aria-label="Close" onClick={() => ref.current?.close()}>
          <Icon name="close" />
        </button>
        <h2 id="auth-title">{title}</h2>
        {showProviders && (
          <p className="muted auth-sub">Save your progress and pick up on any device.</p>
        )}

        {showProviders && (oauth.length > 0 || devEnabled) && (
          <div className="signin-buttons">
            {oauth.map((p) => (
              <button key={p} type="button" className="btn provider-btn" disabled={busy} onClick={() => signInWithOAuth(p)}>
                <Icon name={p} className="provider-icon" />
                {OAUTH_LABEL[p]}
              </button>
            ))}
            {devEnabled && (
              <button
                type="button"
                className="btn provider-btn"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await signInAsDev();
                    onClose();
                  })
                }
              >
                Continue as dev user
              </button>
            )}
          </div>
        )}

        {showProviders && passwordEnabled && (oauth.length > 0 || devEnabled) && (
          <div className="auth-divider">
            <span>or use email</span>
          </div>
        )}

        {view.kind === "signin" && passwordEnabled && (
          <form className="auth-form" onSubmit={onSignIn}>
            <label>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="label-row">
                Password
                <button type="button" className="link-btn" onClick={() => go({ kind: "forgot" })}>
                  Forgot password?
                </button>
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="auth-switch">
              New here?{" "}
              <button type="button" className="link-btn" onClick={() => go({ kind: "signup" })}>
                Create an account
              </button>
            </p>
          </form>
        )}

        {view.kind === "signup" && passwordEnabled && (
          <form className="auth-form" onSubmit={onSignUp}>
            <label>
              <span>
                Name <span className="muted">(optional)</span>
              </span>
              <input type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="hint">At least {MIN_PASSWORD} characters.</span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" className="link-btn" onClick={() => go({ kind: "signin" })}>
                Sign in
              </button>
            </p>
          </form>
        )}

        {view.kind === "forgot" && (
          <form className="auth-form" onSubmit={onForgot}>
            <p className="muted">Enter your account email and we&apos;ll send you a link to choose a new password.</p>
            <label>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <p className="auth-switch">
              <button type="button" className="link-btn" onClick={() => go({ kind: "signin" })}>
                Back to sign in
              </button>
            </p>
          </form>
        )}

        {view.kind === "sent" && (
          <div className="auth-form">
            <p>
              If <strong>{view.email}</strong> can receive email, we&apos;ve sent a{" "}
              {view.purpose === "verify" ? "link to verify your address" : "password reset link"}. It may take a
              minute. Check your spam folder too.
            </p>
            {error && <p className="form-error" role="alert">{error}</p>}
            {view.purpose === "verify" && (
              <button type="button" className="btn" disabled={busy} onClick={() => resendVerification(view.email)}>
                Resend email
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={() => go({ kind: "signin" })}>
              Back to sign in
            </button>
          </div>
        )}

        {view.kind === "unverified" && (
          <div className="auth-form">
            <p>
              <strong>{view.email}</strong> hasn&apos;t been verified yet. Open the link we emailed you, or get a new
              one.
            </p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => resendVerification(view.email)}>
              {busy ? "Sending…" : "Send a new verification link"}
            </button>
            <button type="button" className="btn" onClick={() => go({ kind: "signin" })}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
