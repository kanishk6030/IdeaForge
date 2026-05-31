import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const CreateIdea = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: "",
    problem: "",
    solution: "",
    difficulty: "",
    techStack: "",
    rolesNeeded: "",
    tags: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const parseList = (value) => value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) return
    setLoading(true)
    setError("")
    try {
      const payload = {
        title: form.title,
        problem: form.problem,
        solution: form.solution,
        difficulty: form.difficulty || undefined,
        techStack: form.techStack ? parseList(form.techStack) : undefined,
        rolesNeeded: form.rolesNeeded ? parseList(form.rolesNeeded) : undefined,
        tags: form.tags ? parseList(form.tags) : undefined
      }
      const { data } = await api.post("/api/ideas", payload)
      navigate(`/ideas/${data.idea._id}`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create idea.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="page-stack narrow-page">
        <div className="card">
          <h2>Login required</h2>
          <p className="muted">You need an account to share new ideas.</p>
          <Link className="button compact" to="/login">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack narrow-page">
      <section className="page-header">
        <span className="eyebrow">Create</span>
        <h1>Publish a new idea</h1>
        <p>Describe the problem, your proposed solution, and the kind of help you need.</p>
      </section>

      <section className="card">
        {error && <div className="alert">{error}</div>}
        <form className="form-row" onSubmit={handleSubmit}>
          <label className="field">
            <span>Idea title</span>
            <input
              className="input"
              name="title"
              placeholder="e.g. AI study planner"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Problem</span>
            <textarea
              className="textarea"
              name="problem"
              placeholder="What problem does this solve?"
              value={form.problem}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Solution</span>
            <textarea
              className="textarea"
              name="solution"
              placeholder="How do you want to solve it?"
              value={form.solution}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Difficulty</span>
              <select
                className="select"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="">Choose difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="field">
              <span>Tech stack</span>
              <input
                className="input"
                name="techStack"
                placeholder="React, Node, MongoDB"
                value={form.techStack}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Roles needed</span>
              <input
                className="input"
                name="rolesNeeded"
                placeholder="Designer, Backend Dev"
                value={form.rolesNeeded}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Tags</span>
              <input
                className="input"
                name="tags"
                placeholder="AI, education, productivity"
                value={form.tags}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <Link className="button secondary" to="/">Cancel</Link>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish idea"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateIdea
