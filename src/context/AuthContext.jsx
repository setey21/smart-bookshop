import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  const loadProfile = useCallback(async (userId) => {
    setProfileError('')
    try {
      const nextProfile = await authService.getProfile(userId)
      setProfile(nextProfile)
    } catch (error) {
      setProfile(null)
      setProfileError(error.message || 'Could not load your demo profile.')
    }
  }, [])

  useEffect(() => {
    let active = true
    const { data: { subscription } } = authService.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (nextSession?.user) {
        setLoading(true)
        await loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
        setProfileError('')
      }
      if (active) setLoading(false)
    })

    authService.getSession().then(async (nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (nextSession?.user) await loadProfile(nextSession.user.id)
      if (active) setLoading(false)
    }).catch((error) => {
      if (active) {
        setProfileError(error.message || 'Could not restore your demo session.')
        setLoading(false)
      }
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [loadProfile, session])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    profileError,
    refreshProfile,
  }), [session, profile, loading, profileError, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
