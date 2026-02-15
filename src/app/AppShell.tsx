import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { useToast } from "../ui/toast";

function cx(active: boolean) {
  return active ? "navlink active" : "navlink";
}

export function AppShell() {
  const { user, profile, avatarUrl, signOut, isVerified } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const displayName = profile?.username ?? user?.email ?? "—";

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <NavLink to="/" end className={({ isActive }) => cx(isActive)}>
            HOME
          </NavLink>
          <NavLink to="/deadline" className={({ isActive }) => cx(isActive)}>
            DEADLINE
          </NavLink>
          <NavLink to="/logbook" className={({ isActive }) => cx(isActive)}>
            LOGBOOK
          </NavLink>
          <NavLink to="/focus" className={({ isActive }) => cx(isActive)}>
            FOCUS
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => cx(isActive)}>
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

          <span className="chiptext">{displayName}</span>

          <button
            className="btn btn-ghost logoutBtn"
            onClick={handleLogout}
            type="button"
          >
            LOG OUT
          </button>

          <button
            className="btn btn-ghost menuBtn"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            MENU
          </button>
        </div>

        {menuOpen ? (
          <>
            <div className="menuBackdrop" onClick={() => setMenuOpen(false)} />
            <div
              className="mobileMenu"
              role="dialog"
              aria-label="Menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobileMenuHead">
                <div className="mono">NODE: NAV</div>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setMenuOpen(false)}
                >
                  CLOSE
                </button>
              </div>

              <div className="mobileMenuLinks">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => cx(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  HOME
                </NavLink>
                <NavLink
                  to="/deadline"
                  className={({ isActive }) => cx(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  DEADLINE
                </NavLink>
                <NavLink
                  to="/logbook"
                  className={({ isActive }) => cx(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  LOGBOOK
                </NavLink>
                <NavLink to="/focus" className={({ isActive }) => cx(isActive)}>
                  FOCUS
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => cx(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  SETTINGS
                </NavLink>
              </div>

              {!isVerified ? (
                <button
                  className="btn"
                  type="button"
                  onClick={resendVerification}
                >
                  RESEND VERIFICATION
                </button>
              ) : null}

              <button
                className="btn btn-ghost"
                type="button"
                onClick={handleLogout}
              >
                LOG OUT
              </button>
            </div>
          </>
        ) : null}
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
