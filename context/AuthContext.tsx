'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiRequest } from '@/lib/api-client'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/lib/types/api'
import type { Permission } from '@/lib/admin-permissions'

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user' | ''
  roles: string[]
}

interface AuthContextType {
  user: AuthUser | null
  permissions: Permission[] | null
  hasPermission: (required: string | string[]) => boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser | null>
  register: (data: RegisterRequest) => Promise<AuthUser | null>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapRoles(roles: string[]): AuthUser['role'] {
  const clean = roles.filter(r => r && r.trim().length > 0).map(r => r.toLowerCase().trim())
  if (clean.includes('admin')) return 'admin'
  if (clean.includes('manager')) return 'manager'
  return 'user'
}

/**
 * The auth endpoints return a flat payload (no `user` wrapper): login gives
 * { userId, email, roles, username, ... } and /auth/me gives the JWT claims
 * { userId, _id, sub, username, email, roles }. Neither carries firstname /
 * lastname, so the display name falls back to the username / email local-part.
 */
function toAuthUser(userData: any): AuthUser {
  const rawRoles = normalizeRoles(userData?.roles)
  const roles = rawRoles.length > 0 ? rawRoles : ['user']
  const first = String(userData?.firstname ?? '').trim()
  const last = String(userData?.lastname ?? '').trim()
  const fullName = `${first} ${last}`.trim()
  const name =
    fullName ||
    userData?.name ||
    userData?.username ||
    (userData?.email ? userData.email.split('@')[0] : 'User')
  return {
    id: userData?.id || userData?._id || userData?.userId || userData?.sub || '',
    name,
    email: userData?.email || '',
    role: mapRoles(roles),
    roles,
  }
}

function normalizeRoles(value: any): string[] {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : []
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<Permission[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPermissions = useCallback(async (role: AuthUser['role']) => {
    if (role === 'admin') {
      setPermissions(null)
      return
    }
    try {
      const data: any = await apiRequest('/managers/me/config').catch(() => null)
      setPermissions(Array.isArray(data?.permissions) ? data.permissions : null)
    } catch {
      setPermissions(null)
    }
  }, [])

  const hasPermission = useCallback(
    (required: string | string[]): boolean => {
      if (user?.role === 'admin') return true
      if (!required) return true
      const list = Array.isArray(required) ? required : [required]
      if (list.length === 0) return true
      return list.some((p) => permissions?.includes(p as Permission))
    },
    [user?.role, permissions],
  )

  const refreshAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      let response: any
      try {
        response = await apiRequest<any>('/api/auth/me', { method: 'GET' })
      } catch (err: any) {
        // Server restarting / network blip is not "logged out": retry once.
        if (err?.status === 0 || err?.status >= 500) {
          await new Promise((r) => setTimeout(r, 1500))
          response = await apiRequest<any>('/api/auth/me', { method: 'GET' })
        } else {
          throw err
        }
      }
      // /auth/me returns the JWT claims object directly.
      if (response && (response._id || response.userId || response.sub)) {
        const authUser = toAuthUser(response)
        setUser(authUser)
        await fetchPermissions(authUser.role)
      } else {
        setUser(null)
        setPermissions(null)
      }
    } catch {
      setUser(null)
      setPermissions(null)
    } finally {
      setIsLoading(false)
    }
  }, [fetchPermissions])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const response = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (response) {
        const authenticatedUser = toAuthUser(response)
        setUser(authenticatedUser)
        await fetchPermissions(authenticatedUser.role)
        return authenticatedUser
      }
      return null
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    }
  }, [fetchPermissions])

  const register = useCallback(async (data: RegisterRequest): Promise<AuthUser | null> => {
    try {
      const response = await apiRequest<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (response) {
        return toAuthUser(response)
      }
      return null
    } catch (err) {
      console.error('Registration failed:', err)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null)
      setPermissions(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        hasPermission,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'admin' || user?.role === 'manager',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}