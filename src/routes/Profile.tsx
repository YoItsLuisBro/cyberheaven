import React from "react";
import { useAuth } from "../lib/auth";
import { saveUsername, uploadAvatar } from "../lib/profile";
import { supabase } from "../lib/supabase";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function Profile() {
  const { user, profile, avatarUrl, refreshProfile } = useAuth();
  const [username, setUsername] = React.useState(profile?.username ?? "");
  const [checking, setChecking] = React.useState(false);
  const [available, setAvailable] = React.useState<boolean | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  React.useEffect(() => {
    const v = username.trim().toLowerCase();
    setStatus(null);
    setErr(null);

    if (!v) {
      setAvailable(null);
      return;
    }
    if (!USERNAME_RE.test(v)) {
      setAvailable(null);
      return;
    }
    if (v === (profile?.username ?? "")) {
      setAvailable(true);
      return;
    }

    const t = window.setTimeout(async () => {
      setChecking(true);
      try {
        const { data, error } = await supabase
          .schema("core")
          .rpc("is_username_available", { p_username: v });

        if (error) throw error;
        setAvailable(Boolean(data));
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 300);

    return () => window.clearTimeout(t);
  }, [username, profile?.username]);

  async function onSaveUsername() {
    const v = username.trim().toLowerCase();
    setErr(null);
    setStatus(null);

    if (!USERNAME_RE.test(v)) {
      setErr("USERNAME MUST BE 3–20 CHARS: a-z, 0-9, underscore.");
      return;
    }
    if (available === false) {
      setErr("USERNAME IS TAKEN.");
      return;
    }

    setBusy(true);
    try {
      const res = await saveUsername(v);
      if (res.error) throw res.error;

      setStatus("SAVED.");
      await refreshProfile();
    } catch {
      setErr("FAILED TO SAVE USERNAME.");
    } finally {
      setBusy(false);
    }
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setErr(null);
    setStatus(null);

    setBusy(true);
    try {
      const res = await uploadAvatar(file);
      if (res.error) throw res.error;

      setStatus("AVATAR UPDATED.");
      await refreshProfile();
    } catch {
      setErr("FAILED TO UPLOAD AVATAR.");
    } finally {
      setBusy(false);
    }
  }

  const displayName = profile?.username ?? user?.email ?? "—";

  return (
    <div className="page">
      <h1 className="h2">PROFILE</h1>

      <div className="note">
        <div className="mono">EMAIL: {user?.email ?? "—"}</div>
        <div className="mono">DISPLAY: {displayName}</div>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 14, maxWidth: 720 }}>
        <div className="card" style={{ minHeight: 0 }}>
          <div className="cardtitle">AVATAR</div>

          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="avatar avatar-lg" title={displayName}>
              {avatarUrl ? (
                <img className="avatarImg" src={avatarUrl} alt="avatar" />
              ) : (
                <div className="avatarFallback" aria-hidden="true">
                  {(displayName[0] ?? "U").toUpperCase()}
                </div>
              )}
            </div>

            <label
              className="btn btn-ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              UPLOAD IMAGE
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
                disabled={busy}
              />
            </label>
          </div>
        </div>

        <div className="card" style={{ minHeight: 0 }}>
          <div className="cardtitle">USERNAME</div>

          <label className="label" style={{ marginTop: 10 }}>
            USERNAME (a-z / 0-9 / _)
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. luis_fonseca"
              autoComplete="username"
              spellCheck={false}
            />
          </label>

          <div className="muted" style={{ marginTop: 8 }}>
            {checking
              ? "CHECKING…"
              : username.trim()
                ? USERNAME_RE.test(username.trim().toLowerCase())
                  ? available === true
                    ? "AVAILABLE"
                    : available === false
                      ? "TAKEN"
                      : "—"
                  : "INVALID FORMAT"
                : "—"}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={onSaveUsername}
            >
              {busy ? "WORKING…" : "SAVE USERNAME"}
            </button>
          </div>

          {status ? (
            <div className="ok" style={{ marginTop: 12 }}>
              {status}
            </div>
          ) : null}
          {err ? (
            <div className="error" style={{ marginTop: 12 }}>
              {err}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
