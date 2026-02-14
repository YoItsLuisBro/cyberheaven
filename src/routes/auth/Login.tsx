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
      const ident = identifier.trim();

      // Resolve username -> email (or pass through if ident already looks like email)
      const { data, error: rpcErr } = await supabase
        .schema("core")
        .rpc("login_email", { p_identifier: ident });

      // If RPC fails (schema not exposed, function missing, etc.)
      if (rpcErr) throw rpcErr;

      // If ident is a username and it doesn't exist, data will be null.
      // We keep the error message generic.
      if (!data && !ident.includes("@")) {
        throw new Error("Unknown username");
      }

      const loginEmail = (data ?? ident).trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

      nav("/"); // or navigate("/"), depending on your hook variable name
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
