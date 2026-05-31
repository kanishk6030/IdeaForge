import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="ops-page">
      <aside className="ops-sidebar">
        <NavLink to="/" className="ops-brand" aria-label="IdeaForge home">
          <span className="brand-icon material-symbols-outlined">biotech</span>
          <span>
            <strong>IdeaForge</strong>
            <small>Forge Status: Active</small>
          </span>
        </NavLink>

        <nav className="ops-nav" aria-label="Primary navigation">
          <NavLink to="/">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/profile">
            <span className="material-symbols-outlined">account_tree</span>
            Projects
          </NavLink>
          <NavLink to="/join-requests">
            <span className="material-symbols-outlined">groups</span>
            Collaborators
          </NavLink>
          <NavLink to="/notifications">
            <span className="material-symbols-outlined">auto_awesome</span>
            Breakthroughs
          </NavLink>
          <NavLink to="/ideas/new">
            <span className="material-symbols-outlined">biotech</span>
            Forge Lab
          </NavLink>
        </nav>

        <Link className="button creation-new-button" to={user ? "/ideas/new" : "/login"}>
          <span className="material-symbols-outlined">add</span>
          New Project
        </Link>

        <nav className="ops-nav ops-nav-bottom" aria-label="Secondary navigation">
          <Link to="/">
            <span className="material-symbols-outlined">description</span>
            Docs
          </Link>
          <Link to="/profile">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </nav>
      </aside>

      <div className="ops-main">
        <header className="ops-topbar">
          <label className="ops-search" aria-label="Search logs">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search logs..." />
          </label>
          <div className="profile-top-actions">
            <NavLink className="icon-button" to="/notifications" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </NavLink>
            <button className="icon-button" type="button" aria-label="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="icon-button" type="button" aria-label="Help">
              <span className="material-symbols-outlined">help</span>
            </button>
            <Link className="profile-mini-avatar" to={user ? "/profile" : "/login"}>
              {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name || "U").charAt(0)}
            </Link>
            {user && (
              <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sign out">
                <span className="material-symbols-outlined">logout</span>
              </button>
            )}
          </div>
        </header>

        <main className="ops-content">
          <Outlet />
        </main>

        <footer className="ops-footer">
          <span>© 2026 IdeaForge. All systems operational.</span>
          <nav>
            <Link to="/">Documentation</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Platform Health</Link>
          </nav>
        </footer>
      </div>
    </div>
  )
}

export default Layout
