import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/client.js"

const UserProfile = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [ideasCount, setIdeasCount] = useState(0)
  const [error, setError] = useState("")

  const normalizeUrl = (value) => {
    if (!value) return ""
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value
    }
    return `https://${value}`
  }

  useEffect(() => {
    const loadUser = async () => {
      setError("")
      try {
        const { data } = await api.get(`/api/users/${id}`)
        setUser(data.user)
      } catch (err) {
        setError("Failed to load user profile.")
      }
    }

    loadUser()
  }, [id])

  useEffect(() => {
    const loadIdeasCount = async () => {
      try {
        const { data } = await api.get("/api/ideas", { params: { limit: 100 } })
        const ownedIdeas = (data.ideas || []).filter(
          (idea) => String(idea.createdBy?._id) === String(id)
        )
        setIdeasCount(ownedIdeas.length)
      } catch (err) {
        setIdeasCount(0)
      }
    }

    loadIdeasCount()
  }, [id])

  if (error) {
    return <div className="card">{error}</div>
  }

  if (!user) {
    return <div className="card">Loading profile...</div>
  }

  return (
    <section className="card card-spaced">
      <div className="card-header">
        <h2>{user.name}</h2>
        <span className="badge">{user.email}</span>
      </div>
      <div className="profile-grid">
        <div className="profile-summary">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span className="muted">No photo</span>
            )}
          </div>
          <div>
            <h3 className="section-title">Overview</h3>
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
        <div className="form-row">
          <div>
            <strong>Bio</strong>
            <p className="muted">{user.bio || "No bio shared."}</p>
          </div>
          <div className="social-links">
            {user.linkedinUrl && (
              <a
                className="button secondary"
                href={normalizeUrl(user.linkedinUrl)}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {user.githubUrl && (
              <a
                className="button secondary"
                href={normalizeUrl(user.githubUrl)}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserProfile
