import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const Profile = () => {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatar: "",
    linkedinUrl: "",
    githubUrl: ""
  })
  const [ideasCount, setIdeasCount] = useState(0)
  const [managedIdeas, setManagedIdeas] = useState([])
  const [managedLoading, setManagedLoading] = useState(false)
  const [managedError, setManagedError] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || ""
      })
    }
  }, [user])

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return
      setManagedLoading(true)
      setManagedError("")
      try {
        const { data } = await api.get("/api/ideas", { params: { limit: 100 } })
        const ownedIdeas = (data.ideas || []).filter(
          (idea) => String(idea.createdBy?._id) === String(user._id)
        )

        setIdeasCount(ownedIdeas.length)

        const enriched = await Promise.all(ownedIdeas.map(async (idea) => {
          const [reactionsRes, requestsRes] = await Promise.all([
            api.get(`/api/reactions/${idea._id}`, { params: { limit: 1 } }),
            api.get(`/api/join-requests/idea/${idea._id}`, { params: { limit: 100 } })
          ])

          return {
            ...idea,
            reactionsCount: reactionsRes.data.totalReactions || 0,
            approvedRequests: (requestsRes.data.requests || []).filter(
              (request) => request.status === "accepted"
            )
          }
        }))

        setManagedIdeas(enriched)
      } catch (err) {
        setManagedError("Failed to load your projects.")
      } finally {
        setManagedLoading(false)
      }
    }

    loadProfileData()
  }, [user])

  const handleRemoveMember = async (ideaId, requestId) => {
    setManagedError("")
    const previous = managedIdeas
    setManagedIdeas((items) => items.map((idea) => (
      idea._id !== ideaId
        ? idea
        : {
          ...idea,
          approvedRequests: idea.approvedRequests.filter((request) => request._id !== requestId)
        }
    )))
    try {
      await api.put(`/api/join-requests/${requestId}/remove`)
    } catch (err) {
      setManagedIdeas(previous)
      setManagedError("Unable to remove member.")
    }
  }

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    setError("")
    try {
      await api.put("/api/users/me", form)
      setMessage("Profile updated.")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.")
    }
  }

  if (loading) {
    return <div className="page-stack"><div className="card">Loading profile...</div></div>
  }

  if (!user) {
    return (
      <div className="page-stack narrow-page">
        <div className="card">
          <h2>Login required</h2>
          <p className="muted">You need an account to update your profile.</p>
          <Link className="button compact" to="/login">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="eyebrow">Profile</span>
        <h1>Your workspace</h1>
        <p>Manage your public profile and the ideas you own.</p>
      </section>

      {(error || message || managedError) && (
        <div className="message-stack">
          {error && <div className="alert">{error}</div>}
          {message && <div className="banner">{message}</div>}
          {managedError && <div className="alert">{managedError}</div>}
        </div>
      )}

      <section className="profile-layout">
        <div className="card profile-card">
          <div className="profile-summary">
            <div className="profile-avatar">
              {form.avatar ? <img src={form.avatar} alt={form.name} /> : <span>{(form.name || "U").charAt(0)}</span>}
            </div>
            <div>
              <h2>{form.name || user.name || "User"}</h2>
              <p className="muted">{form.bio || "Add a bio so collaborators know what you like to build."}</p>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>Ideas</span>
              <strong>{ideasCount}</strong>
            </div>
            <div className="stat-card">
              <span>Member since</span>
              <strong>{user.createdAt ? new Date(user.createdAt).getFullYear() : "Now"}</strong>
            </div>
          </div>

          <form className="form-row" onSubmit={handleSubmit}>
            <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <input className="input" name="avatar" placeholder="Avatar URL" value={form.avatar} onChange={handleChange} />
            <div className="form-grid">
              <input className="input" name="githubUrl" placeholder="GitHub URL" value={form.githubUrl} onChange={handleChange} />
              <input className="input" name="linkedinUrl" placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={handleChange} />
            </div>
            <textarea className="textarea" name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} />
            <button className="button" type="submit">Save profile</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Your projects</h2>
            <Link className="button compact" to="/ideas/new">New idea</Link>
          </div>

          {managedLoading && <div className="muted">Loading projects...</div>}
          {!managedLoading && managedIdeas.length === 0 && (
            <p className="muted">No projects yet. Publish your first idea.</p>
          )}

          {!managedLoading && managedIdeas.length > 0 && (
            <div className="project-list">
              {managedIdeas.map((idea) => (
                <article key={idea._id} className="project-row">
                  <div>
                    <h3>{idea.title}</h3>
                    <p className="muted">Reactions: {idea.reactionsCount}</p>
                  </div>
                  <div className="project-actions">
                    <Link className="inline-link" to={`/ideas/${idea._id}`}>View</Link>
                    {idea.approvedRequests.length > 0 && (
                      <span className="badge">{idea.approvedRequests.length} members</span>
                    )}
                  </div>
                  {idea.approvedRequests.length > 0 && (
                    <div className="member-list">
                      {idea.approvedRequests.map((request) => (
                        <div key={request._id} className="member-row">
                          <span>{request.userId?.name || "Unknown"} · {request.requestedRole}</span>
                          <button
                            className="button danger compact"
                            onClick={() => handleRemoveMember(idea._id, request._id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Profile
