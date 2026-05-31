import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const Home = () => {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    techStack: ""
  })

  const fetchIdeas = async (pageNumber = page) => {
    setLoading(true)
    setError("")
    try {
      const params = {
        page: pageNumber,
        limit: 30
      }
      if (filters.search) params.search = filters.search
      if (filters.difficulty) params.difficulty = filters.difficulty
      if (filters.techStack) params.techStack = filters.techStack
      const { data } = await api.get("/api/ideas", { params })
      setIdeas(data.ideas || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError("Failed to load ideas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas(page)
  }, [page])

  const handleFilterChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const handleApplyFilters = () => {
    setPage(1)
    fetchIdeas(1)
  }

  return (
    <div className="page-stack">
      <section className="simple-hero">
        <span className="eyebrow">IdeaForge</span>
        <h1>Share ideas. Find collaborators. Build faster.</h1>
        <p>
          A simple place to publish project ideas, discover useful tech stacks,
          and connect with people who want to help ship.
        </p>
        <div className="hero-actions">
          <Link className="button" to={user ? "/ideas/new" : "/login"}>
            {user ? "Create idea" : "Get started"}
          </Link>
          <a className="button secondary" href="#idea-board">
            Browse ideas
          </a>
        </div>
      </section>

      <section className="card filter-card" aria-label="Idea filters">
        <input
          className="input"
          placeholder="Search by title"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select
          className="select"
          name="difficulty"
          value={filters.difficulty}
          onChange={handleFilterChange}
        >
          <option value="">Any difficulty</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input
          className="input"
          placeholder="Tech stack"
          name="techStack"
          value={filters.techStack}
          onChange={handleFilterChange}
        />
        <button className="button" onClick={handleApplyFilters}>
          Search
        </button>
      </section>

      {error && <div className="alert">{error}</div>}

      {!user && (
        <div className="banner">
          <div>
            <strong>Sign in to collaborate</strong>
            <p>React, comment, and send join requests after login.</p>
          </div>
          <Link className="button compact" to="/login">Sign in</Link>
        </div>
      )}

      <section id="idea-board" className="page-section">
        <div className="section-heading">
          <h2>Latest ideas</h2>
          <span>{ideas.length} shown</span>
        </div>

        {loading && (
          <div className="idea-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton skeleton-line large" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        )}

        {!loading && ideas.length === 0 && (
          <div className="card">No ideas found. Try another filter.</div>
        )}

        {!loading && ideas.length > 0 && (
          <div className="idea-grid">
            {ideas.map((idea) => (
              <article key={idea._id} className="card idea-card">
                <div className="card-header">
                  <h3>{idea.title}</h3>
                  <span className="badge">{idea.difficulty || "Flexible"}</span>
                </div>
                <p className="muted">{idea.problem}</p>
                <div className="tag-row">
                  {(idea.techStack || []).slice(0, 3).map((stack) => (
                    <span key={stack} className="tag">{stack}</span>
                  ))}
                  {(idea.techStack || []).length === 0 && <span className="tag">Open stack</span>}
                </div>
                <div className="card-footer">
                  <span>By {idea.createdBy?.name || "Unknown"}</span>
                  <Link className="inline-link" to={`/ideas/${idea._id}`}>View</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="button secondary compact"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <button
              className="button secondary compact"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
