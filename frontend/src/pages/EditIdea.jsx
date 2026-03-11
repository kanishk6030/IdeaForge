import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../context/AuthContext.jsx"

const EditIdea = () => {
  const { id } = useParams()
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

  const parseList = (value) => value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  useEffect(() => {
    const loadIdea = async () => {
      try {
        const { data } = await api.get(`/api/ideas/${id}`)
        const idea = data.idea
        setForm({
          title: idea.title || "",
          problem: idea.problem || "",
          solution: idea.solution || "",
          difficulty: idea.difficulty || "",
          techStack: (idea.techStack || []).join(", "),
          rolesNeeded: (idea.rolesNeeded || []).join(", "),
          tags: (idea.tags || []).join(", ")
        })
      } catch (err) {
        setError("Failed to load idea.")
      }
    }
    loadIdea()
  }, [id])

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
      await api.put(`/api/ideas/${id}`, payload)
      navigate(`/ideas/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update idea.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="card">
        <h2>Login required</h2>
        <p className="muted">You need an account to edit ideas.</p>
      </div>
    )
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Refine your idea</h2>
        <span className="badge">Update</span>
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
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  )
}

export default EditIdea
