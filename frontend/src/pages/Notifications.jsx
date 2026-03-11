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
      <div className="card">
        <h2>Login required</h2>
        <p className="muted">You need an account to view notifications.</p>
      </div>
    )
  }

  return (
    <section className="list">
      <div className="card">
        <div className="card-header">
          <h2>Notifications</h2>
          <span className="badge">Inbox</span>
        </div>
        {error && <div className="alert">{error}</div>}
      </div>
      {loading && Array.from({ length: 5 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="skeleton-card">
          <div className="skeleton skeleton-line large" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      ))}
      {!loading && notifications.length === 0 && (
        <div className="card">You are all caught up.</div>
      )}
      {!loading && notifications.map((note) => (
        <div key={note._id} className="card soft">
          <div className="card-header">
            <div>
              <strong>{note.type.replace("_", " ")}</strong>
              <div className="muted">{note.message}</div>
            </div>
            <span className="badge">{note.read ? "read" : "new"}</span>
          </div>
          <div className="form-row">
            <button className="button" onClick={() => markRead(note._id)}>
              Mark read
            </button>
            <button
              className="button secondary"
              onClick={() => deleteNotification(note._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default Notifications
