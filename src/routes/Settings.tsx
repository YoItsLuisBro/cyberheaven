import React from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useToast } from "../ui/toast";
import { canRun, markRan } from "../lib/cooldown";

export function Settings() {
  const toast = useToast();
  const {
    user,
    profile,
    avatarUrl,
    refreshProfile,
    profileLoading,
    isVerified,
  } = useAuth();

  const [username, setUsername] = React.useState(profile?.username ?? "");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const site =
    (import.meta.env.VITE_SITE_URL as string) ?? window.location.origin;

  async function saveUsername() {
    if (!user || busy) return;
    setBusy(true);
    try {
      const u = username.trim();
      if (u.length === 0) {
        toast.push("WARN", "USERNAME CANNOT BE EMPTY.");
        return;
      }
      if (u.length > 24) {
        toast.push("WARN", "USERNAME TOO LONG (MAX 24).");
        return;
      }

      const { error } = await supabase
        .schema("core")
        .from("profiles")
        .update({ username: u })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.push("OK", "USERNAME UPDATED.");
    } catch {
      toast.push("ERR", "FAILED TO UPDATE USERNAME.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!user || busy) return;
    setBusy(true);
    try {
      // Basic file gate
      if (file.size > 3 * 1024 * 1024) {
        toast.push("WARN", "FILE TOO LARGE (MAX 3MB).");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const allowed = new Set(["png", "jpg", "jpeg", "webp"]);
      if (!allowed.has(ext)) {
        toast.push("WARN", "USE PNG/JPG/WEBP.");
        return;
      }

      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const up = await supabase.storage.from("avatars").upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (up.error) throw up.error;

      const { error } = await supabase
        .schema("core")
        .from("profiles")
        .update({ avatar_path: path })
        .eq("id", user.id);
      if (error) throw error;

      await refreshProfile();
      toast.push("OK", "AVATAR UPDATED.");
    } catch {
      toast.push("ERR", "FAILED TO UPLOAD AVATAR.");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!user?.email) return;

    // UI-only throttle to prevent rate-limit pain
    if (!canRun("resend_verify", 30)) {
      toast.push("WARN", "WAIT 30 SECONDS BEFORE RESENDING.");
      return;
    }
    markRan("resend_verify");

    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: `${site}/auth/callback` },
      });
      if (error) throw error;

      toast.push("OK", "VERIFICATION EMAIL SENT.");
    } catch {
      toast.push("ERR", "FAILED TO RESEND VERIFICATION.");
    } finally {
      setBusy(false);
    }
  }

  async function changeEmail() {
    if (busy) return;
    setBusy(true);
    try {
      const email = newEmail.trim().toLowerCase();
      if (!email) {
        toast.push("WARN", "ENTER A NEW EMAIL.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;

      toast.push("OK", "EMAIL UPDATE REQUESTED. CHECK EMAIL TO CONFIRM.");
      setNewEmail("");
    } catch {
      toast.push("ERR", "FAILED TO UPDATE EMAIL.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword() {
    if (busy) return;
    setBusy(true);
    try {
      if (newPass.length < 8) {
        toast.push("WARN", "PASSWORD TOO SHORT (MIN 8).");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;

      toast.push("OK", "PASSWORD UPDATED.");
      setNewPass("");
    } catch {
      toast.push("ERR", "FAILED TO UPDATE PASSWORD.");
    } finally {
      setBusy(false);
    }
  }

  async function purgeMyData() {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.schema("core").rpc("purge_my_data");
      if (error) throw error;
      toast.push("OK", "DATA PURGED.");
      await refreshProfile();
    } catch {
      toast.push("ERR", "FAILED TO PURGE DATA.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="kicker">ACCOUNT</div>
      <h1 className="h2">SETTINGS</h1>

      {/* Identity / Profile */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardtitle">IDENTITY</div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <div className="avatar avatar-lg">
            {avatarUrl ? (
              <img className="avatarImg" src={avatarUrl} alt="avatar" />
            ) : (
              <div className="avatarFallback" aria-hidden="true">
                {(
                  (profile?.username ?? user?.email ?? "U")[0] ?? "U"
                ).toUpperCase()}
              </div>
            )}
          </div>

          <div className="sub">
            <div className="muted">
              EMAIL: <span className="mono">{user?.email ?? "—"}</span>
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              PROFILE:{" "}
              <span className="mono">
                {profileLoading ? "LOADING…" : "READY"}
              </span>
            </div>
          </div>
        </div>

        <div className="form" style={{ marginTop: 12 }}>
          <label className="label">
            USERNAME
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn"
              type="button"
              disabled={busy || profileLoading}
              onClick={saveUsername}
            >
              SAVE USERNAME
            </button>

            <label
              className="btn btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              UPLOAD AVATAR
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAvatar(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardtitle">VERIFICATION</div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <div className={isVerified ? "statustag ok" : "statustag warn"}>
            {isVerified ? "VERIFIED" : "UNVERIFIED"}
          </div>

          {!isVerified ? (
            <button
              className="btn btn-ghost"
              type="button"
              disabled={busy}
              onClick={resendVerification}
            >
              RESEND VERIFICATION
            </button>
          ) : (
            <div className="muted mono">OK.</div>
          )}
        </div>

        {!isVerified ? (
          <div className="note" style={{ marginTop: 10 }}>
            YOU MUST VERIFY YOUR EMAIL TO FULLY ENABLE THE SYSTEM.
          </div>
        ) : null}
      </div>

      {/* Account changes */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardtitle">CHANGE EMAIL</div>
        <div className="form" style={{ marginTop: 10 }}>
          <label className="label">
            NEW EMAIL
            <input
              className="input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </label>
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={changeEmail}
          >
            UPDATE EMAIL
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardtitle">CHANGE PASSWORD</div>
        <div className="form" style={{ marginTop: 10 }}>
          <label className="label">
            NEW PASSWORD
            <input
              className="input"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </label>
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={changePassword}
          >
            UPDATE PASSWORD
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardtitle">DANGER</div>
        <div className="note" style={{ marginTop: 10 }}>
          THIS DELETES YOUR TASKS, LOGBOOK ENTRIES, AND PROFILE ROW. (AUTH
          ACCOUNT STAYS.)
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          disabled={busy}
          onClick={purgeMyData}
          style={{ marginTop: 10 }}
        >
          PURGE MY DATA
        </button>
      </div>
    </div>
  );
}
