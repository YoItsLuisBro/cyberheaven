import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = React.useState(false);
  const [status, setStatus] = React.useState("LOADING…");
  const [p1, setP1] = React.useState("");
  const [p2, setP2] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Recovery links may arrive with ?code=... (PKCE). Try to exchang it
    async function boot() {
      setErr(null);

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // If exchange fails, we still try to see if a session exists
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
        setStatus("ENTER A NEW PASSWORD.");
        return;
      }

      // Also listen for PASSWORD_RECOVERY event (Supabase emits it when link is clicked)
      const { data: sub } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            setReady(true);
            setStatus("ENTER A NEW PASSWORD.");
          }
        },
      );

      setStatus("OPEN THE RESET LINK FROM YOUR EMAIL IN THIS BROWSER.");
      return () => sub.subscription.unsubscribe();
    }

    void boot();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (p1.length < 8) {
      setErr("PASSWORD MUST BE AT LEAST 8 CHARACTERS.");
      return;
    }
    if (p1 !== p2) {
      setErr("PASSWORD DO NOT MATCH.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) throw error;

      setStatus("PASSWORD UPDATED. SENDING YOU TO LOGIN...");
      nav("/login", { replace: true });
    } catch {
      setErr("FAILED TO UPDATE PASSWORD. TRY AGAIN.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage">
      <div className="authcard">
        <div className="authheader">
          <div className="kicker">AUTH</div>
          <h1 className="h2">SET NEW PASSWORD</h1>
        </div>

        <div className="note">{status}</div>

        {!ready ? null : (
          <form onSubmit={onSubmit} className="form" style={{ marginTop: 12 }}>
            <label className="label">
              NEW PASSWORD
              <input
                className="input"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="label">
              CONFIRM PASSWORD
              <input
                className="input"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            {err ? <div className="error">{err}</div> : null}

            <button className="btn" disabled={busy} type="submit">
              {busy ? "WORKING…" : "UPDATE PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
