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
    const loadIdeasCount = async () => {
      if (!user) return
      try {
        const { data } = await api.get("/api/ideas", { params: { limit: 100 } })
        const ownedIdeas = (data.ideas || []).filter(
          (idea) => String(idea.createdBy?._id) === String(user._id)
        )
        setIdeasCount(ownedIdeas.length)
      } catch (err) {
        setIdeasCount(0)
      }
    }

    loadIdeasCount()
  }, [user])

  useEffect(() => {
    const loadManagedIdeas = async () => {
      if (!user) return
      setManagedLoading(true)
      setManagedError("")
      try {
        const { data } = await api.get("/api/ideas", { params: { limit: 100 } })
        const ownedIdeas = (data.ideas || []).filter(
          (idea) => String(idea.createdBy?._id) === String(user._id)
        )

        const enriched = await Promise.all(ownedIdeas.map(async (idea) => {
          const [reactionsRes, requestsRes] = await Promise.all([
            api.get(`/api/reactions/${idea._id}`, { params: { limit: 1 } }),
            api.get(`/api/join-requests/idea/${idea._id}`, { params: { limit: 100 } })
          ])

          const approvedRequests = (requestsRes.data.requests || [])
            .filter((request) => request.status === "accepted")

          return {
            ...idea,
            reactionsCount: reactionsRes.data.totalReactions || 0,
            approvedRequests
          }
        }))

        setManagedIdeas(enriched)
      } catch (err) {
        setManagedError("Failed to load project members.")
      } finally {
        setManagedLoading(false)
      }
    }

    loadManagedIdeas()
  }, [user])

  const handleRemoveMember = async (ideaId, requestId) => {
    setManagedError("")
    const previous = managedIdeas
    const updated = managedIdeas.map((idea) => {
      if (idea._id !== ideaId) return idea
      return {
        ...idea,
        approvedRequests: idea.approvedRequests.filter(
          (request) => request._id !== requestId
        )
      }
    })
    setManagedIdeas(updated)
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
    return <div className="card">Loading profile...</div>
  }

  if (!user) {
    return (
      <div className="card">
        <h2>Login required</h2>
        <p className="muted">You need an account to update your profile.</p>
      </div>
    )
  }

  return (
    <div className="grid">
      <section className="card card-spaced">
        <div className="card-header">
          <h2>Profile</h2>
          <span className="badge">{user.email}</span>
        </div>
        {error && <div className="alert">{error}</div>}
        {message && <div className="banner">{message}</div>}
        <div className="profile-grid">
          <div className="profile-summary">
            <div className="profile-avatar">
              {form.avatar ? (
                <img src={form.avatar} alt={form.name} />
              ) : (
                <span className="muted">No photo</span>
              )}
            </div>
            <div>
              <h3 className="section-title">Your activity</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <span>Ideas uploaded</span>
                  <strong>{ideasCount}</strong>
                </div>
                <div className="stat-card">
                  <span>Member since</span>
                  <strong>{new Date(user.createdAt).getFullYear()}</strong>
                </div>
              </div>
            </div>
          </div>
          <form className="form-row" onSubmit={handleSubmit}>
            <input
              className="input"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              className="input"
              name="avatar"
              placeholder="Avatar URL"
              value={form.avatar}
              onChange={handleChange}
            />
            <div className="form-grid">
              <input
                className="input"
                name="linkedinUrl"
                placeholder="LinkedIn URL"
                value={form.linkedinUrl}
                onChange={handleChange}
              />
              <input
                className="input"
                name="githubUrl"
                placeholder="GitHub URL"
                value={form.githubUrl}
                onChange={handleChange}
              />
            </div>
            <textarea
              className="textarea"
              name="bio"
              placeholder="Bio"
              value={form.bio}
              onChange={handleChange}
            />
            <button className="button" type="submit">Save profile</button>
          </form>
        </div>
      </section>

      <section className="card card-spaced">
        <div className="card-header">
          <h2>Project members</h2>
          <span className="badge">Owner view</span>
        </div>
        {managedError && <div className="alert">{managedError}</div>}
        {managedLoading && <div className="card soft">Loading your projects...</div>}
        {!managedLoading && managedIdeas.length === 0 && (
          <div className="card soft">No projects yet.</div>
        )}
        {!managedLoading && managedIdeas.map((idea) => (
          <div key={idea._id} className="card soft managed-idea-card">
            <div className="card-header">
              <div>
                <h3 className="section-title">{idea.title}</h3>
                <div className="muted">Reactions: {idea.reactionsCount}</div>
              </div>
              <Link className="button secondary" to={`/ideas/${idea._id}`}>
                View idea
              </Link>
            </div>
            {idea.approvedRequests.length === 0 ? (
              <div className="muted">No approved members yet.</div>
            ) : (
              <div className="member-list">
                {idea.approvedRequests.map((request) => (
                  <div key={request._id} className="member-row">
                    {request.userId?._id ? (
                      <Link className="inline-link" to={`/users/${request.userId._id}`}>
                        {request.userId?.name || "Unknown"}
                      </Link>
                    ) : (
                      <span>{request.userId?.name || "Unknown"}</span>
                    )}
                    <div className="member-actions">
                      <span className="muted">Role: {request.requestedRole}</span>
                      <button
                        className="button danger"
                        onClick={() => handleRemoveMember(idea._id, request._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

export default Profile
