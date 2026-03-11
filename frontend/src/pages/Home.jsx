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
  const limit = 30
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    techStack: ""
  })

  const fetchIdeas = async (pageNumber = page) => {
    setLoading(true)
    setError("")
    try {
      const params = {}
      params.page = pageNumber
      params.limit = limit
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

  const goToPrevious = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="grid">
      <section className="hero">
        <div>
          <div className="badge">IdeaForge Backend Ready</div>
          <h1>Launch bold, build smarter, find collaborators fast.</h1>
          <p>
            Share refined project ideas, browse trending problems, and assemble
            teams with clarity.
          </p>
        </div>
        <div className="card soft">
          <h3 className="section-title">Filters</h3>
          <div className="form-row">
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
              placeholder="Tech stack (exact)"
              name="techStack"
              value={filters.techStack}
              onChange={handleFilterChange}
            />
            <button className="button" onClick={handleApplyFilters}>
              Refresh ideas
            </button>
          </div>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      {!user && (
        <div className="banner">
          <div>
            <strong>Login to react, comment, and join teams.</strong>
            <div className="muted">Your account unlocks collaboration tools.</div>
          </div>
          <Link className="button" to="/login">Get started</Link>
        </div>
      )}

      <section className="list">
        {!loading && ideas.length === 0 && (
          <div className="card">No ideas found. Try another filter.</div>
        )}
        <div className="idea-grid">
          {loading && Array.from({ length: 9 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-card">
              <div className="skeleton skeleton-line large" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
          {!loading && ideas.map((idea) => (
            <article key={idea._id} className="card idea-card">
              <div className="card-header">
                <h3>{idea.title}</h3>
                <span className="badge">{idea.difficulty || "flexible"}</span>
              </div>
              <p className="muted">{idea.problem}</p>
              <div className="form-row">
                <div>
                  <strong>Creator</strong>
                  <div className="muted">{idea.createdBy?.name || "Unknown"}</div>
                </div>
                <div>
                  <strong>Stack</strong>
                  <div className="muted">
                    {(idea.techStack || []).slice(0, 3).join(", ") || "Open"}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="list">
                  <div>
                    {(idea.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link className="button accent" to={`/ideas/${idea._id}`}>
                  View detail
                </Link>
              </div>
            </article>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="button secondary"
              onClick={goToPrevious}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {page} of {totalPages}
            </span>
            <button
              className="button secondary"
              onClick={goToNext}
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
