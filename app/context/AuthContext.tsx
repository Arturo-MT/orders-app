import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { AuthContextType } from '@/types/types'

const AuthContext = React.createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)
      setIsSuperAdmin(currentUser?.user_metadata?.role === 'super_admin')
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setIsSuperAdmin(currentUser?.user_metadata?.role === 'super_admin')
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const loginWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setLoading(true)
      setLoginError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) setLoginError(error.message)
      setLoading(false)

      return { error: error?.message ?? null }
    },
    []
  )

  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signUp({ email, password })
      return { error: error?.message ?? null }
    },
    []
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }, [router])

  const value = useMemo(
    () => ({
      user,
      isSuperAdmin,
      loading,
      loginError,
      loginWithPassword,
      signUp,
      logout
    }),
    [user, isSuperAdmin, loading, loginError, loginWithPassword, signUp, logout]
  )

  if (loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => React.useContext(AuthContext)
