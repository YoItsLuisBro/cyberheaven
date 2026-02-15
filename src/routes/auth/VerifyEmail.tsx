import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { canRun, markRan } from "../../lib/cooldown";

export function VerifyEmail() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const email = user?.email ?? "";

  async function resend() {
    if (!email) return;
    setBusy(true);
    setStatus(null);
    if (!canRun("resend_verify", 30)) {
      setStatus("WAIT 30 SECONDS BEFORE RESENDING.");
      return;
    }
    markRan("resend_verify");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("SENT. CHECK YOUR INBOX (AND SPAM).");
    } catch {
      setStatus("FAILED TO RESEND. TRY AGAIN.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="authpage">
      <div className="authcard">
        <div className="authheader">
          <div className="kicker">VERIFY</div>
          <h1 className="h2">EMAIL REQUIRED</h1>
        </div>

        <div className="note">
          Your account is signed in, but your email is not verified yet.
          <div className="mono" style={{ marginTop: 10 }}>
            {email || "—"}
          </div>
        </div>

        {status ? (
          <div className="ok" style={{ marginTop: 12 }}>
            {status}
          </div>
        ) : null}

        <div
          style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}
        >
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={resend}
          >
            {busy ? "WORKING…" : "RESEND VERIFICATION"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={logout}>
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
}
