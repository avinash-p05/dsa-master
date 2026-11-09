import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { api, errorMessage } from "@/lib/api";

const MIN_PASSWORD = 8;

/** Landing page for the link in the password-reset email. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token] = useState(() => params.get("token") ?? "");
  const { refresh, openAuthDialog } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await api.resetPassword(token, password);
      await refresh();
      toast("Password updated. You're signed in.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="card status-page">
        <h1>Reset link missing</h1>
        <p className="muted">Please open the link from your email, or request a new one.</p>
        <button type="button" className="btn btn-primary" onClick={() => openAuthDialog("forgot")}>
          Request a new link
        </button>
      </div>
    );
  }

  return (
    <div className="card status-page">
      <h1>Choose a new password</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="hint">At least {MIN_PASSWORD} characters. You&apos;ll be signed out on other devices.</span>
        </label>
        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}{" "}
            {error.includes("expired") && (
              <button type="button" className="link-btn" onClick={() => openAuthDialog("forgot")}>
                Request a new link
              </button>
            )}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
