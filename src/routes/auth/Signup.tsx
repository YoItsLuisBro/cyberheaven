import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function Signup() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setBusy(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setMsg("SIGNUP OK. CHECK YOUR EMAIL TO VERIFY, THEN COME BACK.");
    } catch {
      setErr("SIGNUP FAILED. TRY A DIFFERENT EMAIL OR A STRONGER PASSWORD.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage">
      <div className="authcard">
        <div className="authheader">
          <div className="kicker">AUTH</div>
          <h1 className="h2">SIGN UP</h1>
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

          {msg ? <div className="ok">{msg}</div> : null}
          {err ? <div className="error">{err}</div> : null}

          <button className="btn" disabled={busy} type="submit">
            {busy ? "WORKING…" : "CREATE ACCOUNT"}
          </button>

          <div className="muted">
            Already have one? <Link to="/login">LOG IN</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
