import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Home() {
  const { user } = useAuth();

  // Step 2 will replace this with your profiles.username + avatar.
  const displayName = user?.email ?? "UNKNOWN USER";

  return (
    <div className="page">
      <div className="hero">
        <div>
          <div className="kicker">WELCOME</div>
          <h1 className="h1">CYBER HEAVEN</h1>
          <div className="sub">
            Signed in as: <span className="mono">{displayName}</span>
          </div>
          <div className="note">
            Step 2 adds: username + avatar upload + email verification
            enforcement + username login.
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
