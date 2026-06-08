import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { authApi } from '../api/client.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aa_admin_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('aa_admin_token'))
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('aa_admin_refresh'))

  const isAuthenticated = Boolean(token && user)

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('aa_admin_token', data.token)
    localStorage.setItem('aa_admin_refresh', data.refreshToken)
    localStorage.setItem('aa_admin_user', JSON.stringify(data.user))
    setToken(data.token)
    setRefreshToken(data.refreshToken)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('aa_admin_token')
    localStorage.removeItem('aa_admin_refresh')
    localStorage.removeItem('aa_admin_user')
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [refreshToken])

  const value = useMemo(
    () => ({ user, token, isAuthenticated, login, logout }),
    [user, token, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
