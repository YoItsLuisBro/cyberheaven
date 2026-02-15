import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Skeleton } from "../ui/Skeleton";
import { useFocus } from "../lib/focus";
import { useNavigate } from "react-router-dom";

export function Home() {
  const { user, profile, avatarUrl, profileLoading } = useAuth();

  const displayName = profile?.username ?? user?.email ?? "UNKNOWN USER";

  const { derived, toggle, reset } = useFocus();
  const nav = useNavigate();

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
                  USER: <span className="mono">{displayName}</span>
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
          <div className="card" style={{ minHeight: 0 }}>
            <div className="cardtitle">FOCUS</div>

            <div
              className="focusMini"
              onClick={() => nav("/focus")}
              role="button"
              tabIndex={0}
            >
              <div className="focusMiniLeft">
                <div className="tag">{derived.label}</div>
                <div className="mono focusMiniTime">{derived.mmss}</div>
              </div>

              <div className="focusMiniRight">
                <button
                  className="btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                  }}
                >
                  {derived.running ? "PAUSE" : "START"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  RESET
                </button>
              </div>
            </div>

            <div className="cardcta" style={{ marginTop: 10 }}>
              OPEN / FOCUS
            </div>
          </div>
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
                USERNAME. AVATAR. EMAIL. PASSWORD. DATA PURGE. NO FLUFF.
              </div>
              <div className="cardcta">OPEN →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
