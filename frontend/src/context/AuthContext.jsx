import { createContext, useContext, useEffect, useMemo, useState } from "react"
import api from "../api/client.js"

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("ideahub_token"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadUser = async (authToken) => {
    if (!authToken) return
    setLoading(true)
    try {
      const { data } = await api.get("/api/users/me")
      setUser(data.user)
    } catch (error) {
      localStorage.removeItem("ideahub_token")
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadUser(token)
    }
  }, [token])

  useEffect(() => {
    if (!token) return undefined
    const interval = setInterval(() => {
      loadUser(token)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem("ideahub_token")
          setToken(null)
          setUser(null)
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [])

  const loginWithToken = (newToken) => {
    localStorage.setItem("ideahub_token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("ideahub_token")
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    token,
    user,
    loading,
    loginWithToken,
    logout
  }), [token, user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
