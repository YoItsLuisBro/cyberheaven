import React from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../ui/toast";

export function Settings() {
  const toast = useToast();

  const [newEmail, setNewEmail] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [busy, setBusy] = React.useState(false);

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

      <div className="card" style={{ marginTop: 14 }}>
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
