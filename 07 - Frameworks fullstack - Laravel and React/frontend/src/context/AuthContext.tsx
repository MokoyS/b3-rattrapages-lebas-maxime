import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../api/client'
import type { UserProfile } from '../types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const me = await api.get<UserProfile>('/me')
      setUser(me)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
      }
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const register: AuthContextValue['register'] = async (data) => {
    const created = await api.post<UserProfile>('/register', data)
    setUser(created)
  }

  const login: AuthContextValue['login'] = async (email, password) => {
    const loggedIn = await api.post<UserProfile>('/login', { email, password })
    setUser(loggedIn)
  }

  const logout = async () => {
    await api.post('/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return ctx
}
