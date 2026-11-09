import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api, errorMessage } from "@/lib/api";

type State = { kind: "working" } | { kind: "done"; name: string } | { kind: "error"; message: string };

/** Landing page for the link in the verification email. */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { refresh, openAuthDialog } = useAuth();
  const [state, setState] = useState<State>({ kind: "working" });
  const started = useRef(false); // tokens are single-use: never submit twice

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = params.get("token");
    // Don't leave the token in the address bar or history.
    window.history.replaceState(null, "", "/verify-email");

    if (!token) {
      setState({ kind: "error", message: "This link is missing its token. Please use the link from your email." });
      return;
    }
    api
      .verifyEmail(token)
      .then(async (user) => {
        await refresh(); // signs the app in and syncs this browser's progress
        setState({ kind: "done", name: user.name ?? "" });
      })
      .catch((err) => setState({ kind: "error", message: errorMessage(err) }));
  }, [params, refresh]);

  return (
    <div className="card status-page">
      {state.kind === "working" && <p>Verifying your email…</p>}
      {state.kind === "done" && (
        <>
          <h1>Email verified ✓</h1>
          <p>
            {state.name ? `Welcome, ${state.name}! ` : ""}You&apos;re signed in, and your progress now syncs to your
            account.
          </p>
          <Link className="btn btn-primary" to="/">
            Go to the roadmap
          </Link>
        </>
      )}
      {state.kind === "error" && (
        <>
          <h1>Couldn&apos;t verify your email</h1>
          <p className="muted">{state.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => openAuthDialog("signin")}>
            Sign in to get a new link
          </button>
        </>
      )}
    </div>
  );
}
