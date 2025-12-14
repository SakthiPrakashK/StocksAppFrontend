import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { identifyUser as lyticsIdentify, clearUser as lyticsClear } from '../services/lytics'
import { initPersonalizeWithUser, refreshPersonalizeForUser } from '../services/personalize'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await api.get('/api/auth/me')
          const userData = response.data.data.user
          setUser(userData)
          setToken(storedToken)
          lyticsIdentify(userData)
          if (userData.id || userData._id) {
            await initPersonalizeWithUser(userData.id || userData._id, userData.email)
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { token: newToken, user: userData } = response.data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    lyticsIdentify(userData)
    if (userData.id || userData._id) {
      await initPersonalizeWithUser(userData.id || userData._id, userData.email)
    }
    return userData
  }

  const signup = async (name, email, password, phone) => {
    const response = await api.post('/api/auth/signup', { name, email, password, phone })
    const { token: newToken, user: userData } = response.data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    lyticsIdentify(userData)
    if (userData.id || userData._id) {
      await initPersonalizeWithUser(userData.id || userData._id, userData.email)
    }
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    lyticsClear()
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me')
      setUser(response.data.data.user)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


