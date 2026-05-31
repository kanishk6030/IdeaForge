import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const Login = () => {
  const navigate = useNavigate()
  const { user, loginWithToken } = useAuth()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (token) {
      loginWithToken(token)
      navigate("/")
    }
  }, [loginWithToken, navigate])

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
    window.location.href = `${baseUrl}/api/auth/google`
  }

  return (
    <section className="login-card login-card-centered">
      <div className="login-card-body">
        <div className="login-card-grid">
          <div>
            <h2>Welcome back</h2>
            <p>Use Google OAuth for a quick login. You will be redirected back once authorization is complete.</p>
          </div>
          <div className="login-pill">Secure Access</div>
        </div>
      </div>
      <div className="login-card-action">
        <button className="login-cta" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </section>
  )
}

export default Login
