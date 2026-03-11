import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const IdeaDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [idea, setIdea] = useState(null)
  const [comments, setComments] = useState([])
  const [reactions, setReactions] = useState([])
  const [commentText, setCommentText] = useState("")
  const [requestedRole, setRequestedRole] = useState("")
  const [joinStatus, setJoinStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchIdea = async () => {
    setLoading(true)
    setError("")
    try {
      const [ideaRes, commentRes, reactionRes] = await Promise.all([
        api.get(`/api/ideas/${id}`),
        api.get(`/api/comments/${id}`),
        api.get(`/api/reactions/${id}`)
      ])
      setIdea(ideaRes.data.idea)
      setComments(commentRes.data.comments || [])
      setReactions(reactionRes.data.reactions || [])
    } catch (err) {
      setError("Failed to load idea detail.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdea()
  }, [id])

  const hasReacted = user
    ? reactions.some((reaction) => String(reaction.userId) === String(user._id))
    : false

  const handleReact = async () => {
    if (!user) return
    setError("")
    const previousReactions = reactions
    try {
      if (hasReacted) {
        const updated = reactions.filter(
          (reaction) => String(reaction.userId) !== String(user._id)
        )
        setReactions(updated)
        await api.delete(`/api/reactions/${id}`)
      } else {
        const optimisticReaction = {
          _id: `temp-${Date.now()}`,
          ideaId: id,
          userId: user._id,
          type: "like"
        }
        setReactions([optimisticReaction, ...reactions])
        await api.post(`/api/reactions/${id}`)
      }
    } catch (err) {
      setReactions(previousReactions)
      setError("Unable to update reaction.")
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const trimmedComment = commentText.trim()
    if (!trimmedComment) return
    setError("")
    const previousComments = comments
    try {
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        userId: { name: user?.name || "You" },
        content: trimmedComment
      }
      setComments([optimisticComment, ...comments])
      setCommentText("")
      await api.post(`/api/comments/${id}`, { content: trimmedComment })
    } catch (err) {
      setComments(previousComments)
      setError("Unable to post comment.")
    }
  }

  const handleJoinRequest = async (event) => {
    event.preventDefault()
    if (!requestedRole.trim()) return
    setError("")
    setJoinStatus("")
    try {
      await api.post(`/api/join-requests/${id}`, {
        requestedRole: requestedRole.trim()
      })
      setJoinStatus("Join request sent.")
      setRequestedRole("")
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send join request.")
    }
  }

  if (loading) {
    return <div className="card">Loading idea...</div>
  }

  if (!idea) {
    return <div className="card">Idea not found.</div>
  }

  const isOwner = user && String(user._id) === String(idea.createdBy?._id)

  return (
    <div className="grid">
      {error && <div className="alert">{error}</div>}
      <section className="card">
        <div className="card-header">
          <div>
            <h2>{idea.title}</h2>
            <div className="muted">
              By {idea.createdBy?._id ? (
                <Link className="inline-link" to={`/users/${idea.createdBy._id}`}>
                  {idea.createdBy?.name || "Unknown"}
                </Link>
              ) : (
                idea.createdBy?.name || "Unknown"
              )}
            </div>
          </div>
          <span className="badge">{idea.difficulty || "flexible"}</span>
        </div>
        <p className="muted">{idea.problem}</p>
        <h3 className="section-title">Solution</h3>
        <p>{idea.solution}</p>
        <div className="form-grid">
          <div>
            <strong>Tech stack</strong>
            <div className="muted">{(idea.techStack || []).join(", ") || "Open"}</div>
          </div>
          <div>
            <strong>Roles needed</strong>
            <div className="muted">{(idea.rolesNeeded || []).join(", ") || "Open"}</div>
          </div>
        </div>
        <div className="form-row">
          <div>
            {(idea.tags || []).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          {isOwner && (
            <Link className="button secondary" to={`/ideas/${idea._id}/edit`}>
              Edit idea
            </Link>
          )}
        </div>
      </section>

      <section className="grid cols-2">
        <div className="card soft">
          <div className="card-header">
            <h3 className="section-title">Reactions</h3>
            <span className="badge">{reactions.length} likes</span>
          </div>
          <p className="muted">Show support or remove your reaction.</p>
          <button className="button" disabled={!user} onClick={handleReact}>
            {hasReacted ? "Remove reaction" : "Like this idea"}
          </button>
          {!user && <p className="muted">Login to react.</p>}
        </div>
        <div className="card soft">
          <h3 className="section-title">Join request</h3>
          {isOwner ? (
            <>
              <p className="muted">Review requests from collaborators.</p>
              <Link className="button" to="/join-requests">
                Manage join requests
              </Link>
            </>
          ) : (
            <>
              <p className="muted">Interested in collaborating? Send a request.</p>
              <form className="form-row" onSubmit={handleJoinRequest}>
                <input
                  className="input"
                  placeholder="Requested role (e.g. Frontend Dev)"
                  value={requestedRole}
                  onChange={(event) => setRequestedRole(event.target.value)}
                  disabled={!user}
                />
                <button className="button" type="submit" disabled={!user}>
                  Send request
                </button>
              </form>
              {joinStatus && <div className="banner">{joinStatus}</div>}
              {!user && <div className="muted">Login to send a request.</div>}
            </>
          )}
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Comments</h3>
        <div className="list">
          {comments.map((comment) => (
            <div key={comment._id} className="card soft">
              <strong>{comment.userId?.name || "Anonymous"}</strong>
              <p className="muted">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="muted">No comments yet.</div>
          )}
        </div>
        <form className="form-row" onSubmit={handleCommentSubmit}>
          <textarea
            className="textarea"
            placeholder="Share a thoughtful note"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            disabled={!user}
          />
          <button className="button" type="submit" disabled={!user}>
            Post comment
          </button>
          {!user && <div className="muted">Login to comment.</div>}
        </form>
      </section>
    </div>
  )
}

export default IdeaDetail
