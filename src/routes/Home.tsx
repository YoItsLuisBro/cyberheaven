import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Home() {
  const { user, profile, avatarUrl } = useAuth();

  const displayName = profile?.username ?? user?.email ?? "UNKNOWN USER";

  return (
    <div className="page">
      <div className="hero">
        <div>
          <div className="kicker">WELCOME</div>
          <h1 className="h1">CYBER HEAVEN</h1>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <div className="avatar avatar-lg">
              {avatarUrl ? (
                <img className="avatarImg" src={avatarUrl} alt="avatar" />
              ) : (
                <div className="avatarFallback" aria-hidden="true">
                  {(displayName[0] ?? "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="sub">
              USER: <span className="mono">{displayName}</span>
              <div className="muted" style={{ marginTop: 6 }}>
                EMAIL: <span className="mono">{user?.email ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="note" style={{ marginTop: 14 }}>
            Use PROFILE to set your username + upload an avatar.
          </div>
        </div>

        <div className="grid2">
          <Link to="/deadline" className="cardlink">
            <div className="card">
              <div className="cardtitle">DEADLINE BRUTAL</div>
              <div className="cardbody">
                Task board + focus timer. Loud labels. Hard dividers.
              </div>
              <div className="cardcta">ENTER →</div>
            </div>
          </Link>

          <Link to="/logbook" className="cardlink">
            <div className="card">
              <div className="cardtitle">BRUTAL LOGBOOK</div>
              <div className="cardbody">
                Journal entries. Brutal composer. Zero fluff.
              </div>
              <div className="cardcta">ENTER →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
