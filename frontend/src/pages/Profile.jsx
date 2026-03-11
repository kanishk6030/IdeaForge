import { useEffect, useState } from "react"
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
  )
}

export default Profile
