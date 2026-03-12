import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const JoinRequests = () => {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [requests, setRequests] = useState([])
  const [selectedIdeaId, setSelectedIdeaId] = useState("")
  const [error, setError] = useState("")
  const [loadingRequests, setLoadingRequests] = useState(false)

  const loadIdeas = async () => {
    if (!user) return
    setError("")
    try {
      const { data } = await api.get("/api/ideas", { params: { limit: 100 } })
      const ownedIdeas = (data.ideas || []).filter(
        (idea) => String(idea.createdBy?._id) === String(user._id)
      )
      setIdeas(ownedIdeas)
      if (ownedIdeas.length > 0) {
        setSelectedIdeaId(ownedIdeas[0]._id)
      }
    } catch (err) {
      setError("Failed to load your ideas.")
    }
  }

  const loadRequests = async (ideaId) => {
    if (!ideaId) return
    setLoadingRequests(true)
    try {
      const { data } = await api.get(`/api/join-requests/idea/${ideaId}`)
      setRequests(data.requests || [])
    } catch (err) {
      setError("Failed to load join requests.")
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    loadIdeas()
  }, [user])

  useEffect(() => {
    if (selectedIdeaId) {
      loadRequests(selectedIdeaId)
    }
  }, [selectedIdeaId])

  const handleAction = async (requestId, action) => {
    setError("")
    const previousRequests = requests
    const updatedStatus = action === "approve" ? "accepted" : "rejected"
    const optimistic = requests.map((request) => (
      request._id === requestId
        ? { ...request, status: updatedStatus }
        : request
    ))
    setRequests(optimistic)
    try {
      await api.put(`/api/join-requests/${requestId}/${action}`)
    } catch (err) {
      setRequests(previousRequests)
      setError("Unable to update request.")
    }
  }

  if (!user) {
    return (
      <div className="card">
        <h2>Login required</h2>
        <p className="muted">You need an account to manage join requests.</p>
      </div>
    )
  }

  return (
    <section className="grid">
      <div className="card">
        <div className="card-header">
          <h2>Join requests</h2>
          <span className="badge">Owner view</span>
        </div>
        {error && <div className="alert">{error}</div>}
        {ideas.length === 0 ? (
          <p className="muted">No ideas found. Publish an idea first.</p>
        ) : (
          <select
            className="select"
            value={selectedIdeaId}
            onChange={(event) => setSelectedIdeaId(event.target.value)}
          >
            {ideas.map((idea) => (
              <option key={idea._id} value={idea._id}>
                {idea.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="list join-requests-list">
        {loadingRequests && Array.from({ length: 4 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="skeleton-card">
            <div className="skeleton skeleton-line large" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
        {!loadingRequests && requests.length === 0 && (
          <div className="card">No requests for this idea yet.</div>
        )}
        {!loadingRequests && requests.map((request) => (
          <div key={request._id} className="card soft join-request-card">
            <div className="card-header">
              <div>
                {request.userId?._id ? (
                  <Link className="inline-link" to={`/users/${request.userId._id}`}>
                    {request.userId?.name || "Unknown"}
                  </Link>
                ) : (
                  <strong>{request.userId?.name || "Unknown"}</strong>
                )}
                <div className="muted">Role: {request.requestedRole}</div>
              </div>
              <span className="badge">{request.status}</span>
            </div>
            <div className="form-row">
              <button
                className="button"
                onClick={() => handleAction(request._id, "approve")}
                disabled={request.status !== "pending"}
              >
                Approve
              </button>
              <button
                className="button secondary"
                onClick={() => handleAction(request._id, "reject")}
                disabled={request.status !== "pending"}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default JoinRequests
