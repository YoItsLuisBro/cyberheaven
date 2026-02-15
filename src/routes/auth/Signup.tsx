import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../ui/toast";
import { canRun, markRan } from "../../lib/cooldown";

export function Signup() {
  const toast = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = React.useState<string | null>(null); // <-- only set after submit

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setErr(null);
    setBusy(true);

    if (!canRun("signup", 60)) {
      setErr("WAIT 60 SECONDS BEFORE TRYING SIGNUP AGAIN.");
      return;
    }
    markRan("signup");

    try {
      const site =
        (import.meta.env.VITE_SITE_URL as string) ?? window.location.origin;
      const cleanEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${site}/auth/callback` },
      });

      if (error) throw error;

      setCreatedEmail(cleanEmail); // <-- now we show the resend button
      toast.push("OK", "ACCOUNT CREATED. CHECK YOUR EMAIL TO VERIFY.");
    } catch {
      setErr("SIGN UP FAILED.");
      setCreatedEmail(null);
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (busy) return;
    if (!createdEmail) return;

    setBusy(true);
    try {
      const site =
        (import.meta.env.VITE_SITE_URL as string) ?? window.location.origin;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: createdEmail,
        options: { emailRedirectTo: `${site}/auth/callback` },
      });

      if (error) throw error;

      toast.push("OK", "VERIFICATION EMAIL SENT. CHECK INBOX/SPAM.");
    } catch {
      toast.push("ERR", "FAILED TO RESEND. TRY AGAIN LATER.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage authpage-cyber">
      <div
        className="bootbar"
        role="banner"
        aria-label="Cyber Heaven system banner"
      >
        <div className="bootcol">
          <div className="bootk">SYSTEM</div>
          <div className="bootv">
            CYBER <span className="acid">HEAVEN</span>
          </div>
        </div>
        <div className="bootcol bootcol-right">
          <div className="bootk">ACCESS</div>
          <div className="bootv">NEW USER</div>
        </div>
      </div>

      <div className="authcard cybercard">
        <div className="chMark" aria-hidden="true">
          <span className="chC">C</span>
          <span className="chH">H</span>
        </div>

        <div className="cyberContent">
          <div className="authheader">
            <div className="kicker">AUTH</div>
            <h1 className="h2">CREATE ACCOUNT</h1>
            <div className="muted" style={{ marginTop: 6 }}>
              EMAIL VERIFICATION REQUIRED.
            </div>
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

            <label className="label">
              PASSWORD
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            {err ? <div className="error">{err}</div> : null}

            <button className="btn" disabled={busy} type="submit">
              {busy ? "WORKING…" : "CREATE ACCOUNT"}
            </button>

            {/* Only appears AFTER user has clicked Create Account successfully */}
            {createdEmail ? (
              <div className="note" style={{ marginTop: 12 }}>
                <div className="mono">VERIFY: {createdEmail}</div>
                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={resendVerification}
                  >
                    RESEND VERIFICATION
                  </button>
                </div>
              </div>
            ) : null}

            <div className="muted" style={{ marginTop: 12 }}>
              Already have an account? <Link to="/login">LOG IN</Link>
            </div>

            <div className="authfooter">
              <span className="mono">CYBERHEAVEN.APP</span>
              <span className="mono">NODE: AUTH</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
