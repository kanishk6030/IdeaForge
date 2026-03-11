import { Link } from "react-router-dom"

const NotFound = () => (
  <section className="card">
    <h2>Page not found</h2>
    <p className="muted">The page you are looking for does not exist.</p>
    <Link className="button" to="/">Back to ideas</Link>
  </section>
)

export default NotFound
