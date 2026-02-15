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
    if (busy) return;

    setErr(null);
    setBusy(true);

    try {
      const ident = identifier.trim();

      const { data: email, error: rpcErr } = await supabase
        .schema("core")
        .rpc("login_email", { p_identifier: ident });

      if (rpcErr) throw rpcErr;

      const loginEmail = (email ?? ident).trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;
      nav("/");
    } catch {
      setErr("AUTH REJECTED.");
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
          <div className="bootv">AUTH GATE</div>
        </div>
      </div>

      <div className="authcard cybercard">
        {/* Watermark */}
        <div className="chMark" aria-hidden="true">
          <span className="chC">C</span>
          <span className="chH">H</span>
        </div>

        <div className="cyberContent">
          <div className="authheader">
            <div className="kicker">AUTH</div>
            <h1 className="h2">LOG IN</h1>
            <div className="muted" style={{ marginTop: 6 }}>
              ENTER <span className="mono">USERNAME</span> OR{" "}
              <span className="mono">EMAIL</span>.
            </div>
          </div>

          <form onSubmit={onSubmit} className="form">
            <label className="label">
              USERNAME OR EMAIL
              <input
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or you@domain.com"
                autoComplete="username"
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

            <div
              className="muted"
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <span>
                No account? <Link to="/signup">SIGN UP</Link>
              </span>
              <span>
                Forgot? <Link to="/forgot">RESET PASSWORD</Link>
              </span>
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
