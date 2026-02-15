import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { canRun, markRan } from "../../lib/cooldown";

export function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    if (!canRun("reset_password", 45)) {
      setStatus("WAIT 45 SECONDS BEFORE TRYING AGAIN.");
      return;
    }
    markRan("reset_password");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset`,
        },
      );
      if (error) throw error;

      // Keep this generic (don't reveal if email exists)
      setStatus("IF THAT EMAIL EXISTS, A RESET LINK WAS SENT.");
    } catch {
      setStatus("FAILED TO SEND RESET EMAIL. TRY AGAIN.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage">
      <div className="authcard">
        <div className="authheader">
          <div className="kicker">AUTH</div>
          <h1 className="h2">RESET PASSWORD</h1>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            EMAIL
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
              required
            />
          </label>

          {status ? <div className="ok">{status}</div> : null}

          <button className="btn" disabled={busy} type="submit">
            {busy ? "WORKING…" : "SEND RESET LINK"}
          </button>

          <div className="muted">
            Back to <Link to="/login">LOG IN</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
