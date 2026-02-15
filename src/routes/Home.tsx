import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Skeleton } from "../ui/Skeleton";

export function Home() {
  const { user, profile, avatarUrl, profileLoading } = useAuth();

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
                  {(
                    (profile?.username ?? user?.email ?? "U")[0] ?? "U"
                  ).toUpperCase()}
                </div>
              )}
            </div>

            <div className="sub">
              {profileLoading ? (
                <>
                  <div style={{ marginBottom: 6 }}>
                    <Skeleton h={16} w={260} />
                  </div>
                  <Skeleton h={14} w={320} />
                </>
              ) : (
                <>
                  USER:{" "}
                  <span className="mono">
                    {displayName}
                  </span>
                  <div className="muted" style={{ marginTop: 6 }}>
                    EMAIL: <span className="mono">{user?.email ?? "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="note" style={{ marginTop: 14 }}>
            Use PROFILE to set your username + upload an avatar.
          </div>
        </div>

        <div className="grid2">
          <Link to="/deadline" className="cardlink">
            <div className="card">
              <div className="cardtitle">DEADLINE MACHINE</div>
              <div className="cardbody">
                TASK BOARD. LOUD LABELS. HARD DIVIDER.
              </div>
              <div className="cardcta">ENTER →</div>
            </div>
          </Link>

          <Link to="/logbook" className="cardlink">
            <div className="card">
              <div className="cardtitle">BRUTAL LOGBOOK</div>
              <div className="cardbody">
                JOURNAL ENTRIES. BRUTAL COMPOSER. ZERO FLUFF
              </div>
              <div className="cardcta">ENTER →</div>
            </div>
          </Link>
          <Link to="/settings" className="cardlink">
            <div className="card">
              <div className="cardtitle">ACCOUT SETTINGS</div>
              <div className="cardbody">
                EMAIL. PASSWORD. DATA PURGE. NO FLUFF.
              </div>
              <div className="cardcta">OPEN →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
