import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { useToast } from "../ui/toast";

export function AppShell() {
  const toast = useToast();
  const { user, profile, avatarUrl, signOut, isVerified } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.username ?? user?.email ?? "—";

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  async function resendVerification() {
    try {
      const email = user?.email;
      if (!email) return;

      const site =
        (import.meta.env.VITE_SITE_URL as string) ?? window.location.origin;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${site}/auth/callback` },
      });

      if (error) throw error;
      toast.push("OK", "VERIFICATION EMAIL SENT.");
    } catch {
      toast.push("ERR", "FAILED TO RESEND VERIFICATION.");
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          CYBER HEAVEN
        </Link>

        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            HOME
          </NavLink>
          <NavLink
            to="/deadline"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            DEADLINE
          </NavLink>
          <NavLink
            to="/logbook"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            LOGBOOK
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            PROFILE
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            SETTINGS
          </NavLink>
        </nav>

        <div className="authchip">
          <div className="avatar" title={displayName}>
            {avatarUrl ? (
              <img className="avatarImg" src={avatarUrl} alt="avatar" />
            ) : (
              <div className="avatarFallback" aria-hidden="true">
                {(displayName[0] ?? "U").toUpperCase()}
              </div>
            )}
          </div>

          <div className={isVerified ? "statustag ok" : "statustag warn"}>
            {isVerified ? "VERIFIED" : "UNVERIFIED"}
          </div>

          {!isVerified ? (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={resendVerification}
            >
              RESEND
            </button>
          ) : null}

          <span className="chiptext">{displayName}</span>

          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            type="button"
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
