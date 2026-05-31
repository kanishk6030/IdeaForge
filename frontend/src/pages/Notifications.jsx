import { useEffect, useState } from "react"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    if (!user) return
    setError("")
    setLoading(true)
    try {
      const { data } = await api.get("/api/notifications")
      setNotifications(data.notifications || [])
    } catch (err) {
      setError("Failed to load notifications.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const markRead = async (id) => {
    setError("")
    const previousNotifications = notifications
    const optimistic = notifications.map((note) => (
      note._id === id ? { ...note, read: true } : note
    ))
    setNotifications(optimistic)
    try {
      await api.put(`/api/notifications/${id}/read`)
    } catch (err) {
      setNotifications(previousNotifications)
      setError("Unable to update notification.")
    }
  }

  const deleteNotification = async (id) => {
    setError("")
    const previousNotifications = notifications
    const optimistic = notifications.filter((note) => note._id !== id)
    setNotifications(optimistic)
    try {
      await api.delete(`/api/notifications/${id}`)
    } catch (err) {
      setNotifications(previousNotifications)
      setError("Unable to delete notification.")
    }
  }

  if (!user) {
    return (
      <div className="page-stack narrow-page">
        <div className="card">
          <h2>Login required</h2>
          <p className="muted">You need an account to view notifications.</p>
        </div>
      </div>
    )
  }

  const fallbackNotifications = [
    {
      _id: "sample-request",
      type: "collaboration_request",
      message: "Alex Rivera wants to join Project: Neural_Mesh",
      read: false,
      tone: "request",
      time: "09:42:15 UTC"
    },
    {
      _id: "sample-deploy",
      type: "deployment_successful",
      message: "Build #9422 deployed to Staging_Environment_B",
      read: false,
      tone: "update",
      time: "08:15:00 UTC"
    },
    {
      _id: "sample-comment",
      type: "new_comment",
      message: "Sarah Chen replied to your thread in Architecture_Review",
      read: false,
      tone: "comment",
      time: "07:55:12 UTC"
    }
  ]
  const visibleNotifications = notifications.length ? notifications : fallbackNotifications

  return (
    <div className="notification-feed">
      <div className="feed-head">
        <div>
          <h1>Notification Feed</h1>
          <p>System-wide updates and collaboration requests.</p>
        </div>
        <div className="segmented-control">
          <button className="active">All</button>
          <button>Requests</button>
          <button>Updates</button>
          <button>Comments</button>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading && Array.from({ length: 5 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="skeleton-card">
          <div className="skeleton skeleton-line large" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      ))}
      {!loading && (
        <section className="feed-section">
          <div className="feed-divider"><span>Today</span></div>
          {visibleNotifications.map((note, index) => (
            <article key={note._id} className={`notification-item ${note.read ? "is-read" : ""} ${note.tone || ""}`}>
              <span className="notification-stripe" />
              <div className="notification-icon">
                <span className="material-symbols-outlined">
                  {note.type.includes("request") ? "person_add" : note.type.includes("comment") ? "forum" : "deployed_code"}
                </span>
              </div>
              <div className="notification-body">
                <div className="notification-copy">
                  <h2>{note.type.replaceAll("_", " ")}</h2>
                  <p>{note.message}</p>
                  {index === 2 && (
                    <blockquote>
                      The logic for the cleanup flow looks solid, but we should throttle it during peak loads.
                    </blockquote>
                  )}
                </div>
                <span className="notification-time">{note.time || new Date(note.createdAt || Date.now()).toLocaleString()}</span>
                {!String(note._id).startsWith("sample") && (
                  <div className="notification-actions">
                    <button className="button compact" onClick={() => markRead(note._id)}>Mark read</button>
                    <button className="button secondary compact" onClick={() => deleteNotification(note._id)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
      <section className="feed-section muted-feed">
        <div className="feed-divider"><span>Yesterday</span></div>
        {["Security Audit Complete", "System Maintenance"].map((title) => (
          <article className="notification-item is-read" key={title}>
            <span className="notification-stripe" />
            <div className="notification-icon">
              <span className="material-symbols-outlined">{title.includes("Security") ? "security" : "storage"}</span>
            </div>
            <div className="notification-body">
              <div className="notification-copy">
                <h2>{title}</h2>
                <p>{title.includes("Security") ? "No critical vulnerabilities detected in Module_Vanguard_API" : "Database migration completed for Region_EU_West_1"}</p>
              </div>
              <span className="notification-time">2026-05-30 14:20</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Notifications
