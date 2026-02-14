import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      // Step 3 will upgrade this to: username OR email login.
      // For now: require email (keeps Step 1 simple + runnable).
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });

      if (error) throw error;
      nav("/");
    } catch {
      setErr("LOGIN FAILED. CHECK YOUR CREDENTIALS.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage">
      <div className="authcard">
        <div className="authheader">
          <div className="kicker">AUTH</div>
          <h1 className="h2">LOG IN</h1>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            EMAIL (STEP 1)
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              autoComplete="current-password"
              required
            />
          </label>

          {err ? <div className="error">{err}</div> : null}

          <button className="btn" disabled={busy} type="submit">
            {busy ? "WORKING…" : "LOG IN"}
          </button>

          <div className="muted">
            No account? <Link to="/signup">SIGN UP</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
