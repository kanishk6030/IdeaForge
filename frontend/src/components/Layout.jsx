import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" />
            <span>IdeaForge</span>
          </div>
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
              Ideas
            </NavLink>
            <NavLink to="/ideas/new" className={({ isActive }) => isActive ? "active" : ""}>
              Create
            </NavLink>
            <NavLink to="/join-requests" className={({ isActive }) => isActive ? "active" : ""}>
              Join Requests
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}>
              Notifications
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
              Profile
            </NavLink>
            {!user && (
              <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>
                Login
              </NavLink>
            )}
          </nav>
          {user && (
            <button className="button secondary" onClick={handleLogout}>
              Sign out
            </button>
          )}
        </div>
      </header>
      <main className="shell">
        <Outlet />
        <footer>
          Built for focused teams and ambitious MVPs.
        </footer>
      </main>
    </div>
  )
}

export default Layout
