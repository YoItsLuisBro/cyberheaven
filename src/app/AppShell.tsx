import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login");
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
        </nav>

        <div className="authchip">
          <span className="chiptext">{user?.email ?? "—"}</span>
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
