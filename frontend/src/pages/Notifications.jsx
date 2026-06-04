import { useEffect, useState } from "react"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

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

  const iconForType = (type = "") => {
    if (type.includes("comment")) return "forum"
    if (type.includes("reaction")) return "thumb_up"
    if (type.includes("join_request") || type.includes("request")) return "person_add"
    return "notifications"
  }

  const labelForType = (type = "") => {
    switch (type) {
      case "join_request":
        return "Join request"
      case "request_approved":
        return "Request approved"
      case "request_rejected":
        return "Request rejected"
      case "reaction":
        return "New reaction"
      case "comment":
        return "New comment"
      default:
        return type.replaceAll("_", " ") || "Notification"
    }
  }

  const toneForType = (type = "") => {
    if (type.includes("comment")) return "comment"
    if (type.includes("reaction")) return "update"
    if (type.includes("request")) return "request"
    return "update"
  }

  const filterMap = {
    all: () => true,
    requests: (note) => note.type?.includes("request"),
    updates: (note) => note.type?.includes("reaction"),
    comments: (note) => note.type?.includes("comment")
  }

  const visibleNotifications = notifications.filter(
    filterMap[activeFilter] || filterMap.all
  )

  return (
    <div className="notification-feed">
      <div className="feed-head">
        <div>
          <h1>Notification Feed</h1>
          <p>System-wide updates and collaboration requests.</p>
        </div>
        <div className="segmented-control">
          <button
            className={activeFilter === "all" ? "active" : ""}
            onClick={() => setActiveFilter("all")}
            type="button"
          >
            All
          </button>
          <button
            className={activeFilter === "requests" ? "active" : ""}
            onClick={() => setActiveFilter("requests")}
            type="button"
          >
            Requests
          </button>
          <button
            className={activeFilter === "updates" ? "active" : ""}
            onClick={() => setActiveFilter("updates")}
            type="button"
          >
            Updates
          </button>
          <button
            className={activeFilter === "comments" ? "active" : ""}
            onClick={() => setActiveFilter("comments")}
            type="button"
          >
            Comments
          </button>
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
      {!loading && notifications.length === 0 && (
        <div className="card">No notifications yet.</div>
      )}
      {!loading && notifications.length > 0 && (
        <section className="feed-section">
          <div className="feed-divider"><span>Latest</span></div>
          {visibleNotifications.map((note) => (
            <article key={note._id} className={`notification-item ${note.read ? "is-read" : ""} ${toneForType(note.type)}`}>
              <span className="notification-stripe" />
              <div className="notification-icon">
                <span className="material-symbols-outlined">
                  {iconForType(note.type)}
                </span>
              </div>
              <div className="notification-body">
                <div className="notification-copy">
                  <h2>{labelForType(note.type)}</h2>
                  <p>{note.message}</p>
                </div>
                <span className="notification-time">{new Date(note.createdAt || Date.now()).toLocaleString()}</span>
                <div className="notification-actions">
                  <button className="button compact" onClick={() => markRead(note._id)}>Mark read</button>
                  <button className="button secondary compact" onClick={() => deleteNotification(note._id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

export default Notifications
