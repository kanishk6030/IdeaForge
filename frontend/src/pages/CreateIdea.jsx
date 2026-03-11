import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
      <div className="card">
        <h2>Login required</h2>
        <p className="muted">You need an account to share new ideas.</p>
      </div>
    )
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Launch a new idea</h2>
        <span className="badge">MVP ready</span>
      </div>
      {error && <div className="alert">{error}</div>}
      <form className="form-row" onSubmit={handleSubmit}>
        <input
          className="input"
          name="title"
          placeholder="Idea title"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          className="textarea"
          name="problem"
          placeholder="Problem statement"
          value={form.problem}
          onChange={handleChange}
        />
        <textarea
          className="textarea"
          name="solution"
          placeholder="Proposed solution"
          value={form.solution}
          onChange={handleChange}
        />
        <div className="form-grid">
          <select
            className="select"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option value="">Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input
            className="input"
            name="techStack"
            placeholder="Tech stack (comma separated)"
            value={form.techStack}
            onChange={handleChange}
          />
          <input
            className="input"
            name="rolesNeeded"
            placeholder="Roles needed (comma separated)"
            value={form.rolesNeeded}
            onChange={handleChange}
          />
          <input
            className="input"
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Publish idea"}
        </button>
      </form>
    </section>
  )
}

export default CreateIdea
