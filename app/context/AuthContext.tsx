import React, { useReducer, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { useRouter } from 'expo-router'
import {
  AuthAction,
  AuthContextType,
  AuthState,
  UserResponseData
} from '@/types/types'

const AuthContext = React.createContext<AuthContextType>({} as AuthContextType)

const USER_STORAGE_KEY = 'TL_USER'
const API_URL = process.env.EXPO_PUBLIC_API_URL

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'FETCH_USER':
      return { ...state, loading: true }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        loginError: null
      }
    case 'REMOVE_USER':
      return { ...state, user: null, loading: false, loginError: null }
    case 'SET_LOGIN_ERROR':
      return { ...state, loginError: action.payload.loginError, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  loginWithPassword: async () => ({} as any),
  logout: () => {},
  loading: true,
  renewToken: async () => ({} as any),
  loginError: null,
  registerUser: async () => ({} as any)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleUser = useCallback(
    async (res: { data: Partial<UserResponseData> | null }) => {
      try {
        if (!res?.data) return
        const stored = await EncryptedStorage.getItem(USER_STORAGE_KEY)
        const parsed = stored ? JSON.parse(stored) : {}
        const user: UserResponseData = {
          ...parsed,
          ...res.data
        } as UserResponseData
        await EncryptedStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
        dispatch({ type: 'SET_USER', payload: { user } })
      } catch (e) {
        console.error('handleUser error', e)
      }
    },
    []
  )

  const loginWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      dispatch({ type: 'FETCH_USER' })
      try {
        const result = await axios.post(`${API_URL}/auth/token/`, {
          email,
          password
        })
        if (result.data?.access && result.data?.refresh) {
          const userFromStorage = {
            access: result.data.access,
            refresh: result.data.refresh
          }
          await EncryptedStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(userFromStorage)
          )
          if (result.data.user) {
            await handleUser({ data: result.data.user })
          } else {
            dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: null } })
          }
          return
        }
        await handleUser(result)
        dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: null } })
      } catch (err) {
        const detail =
          (axios.isAxiosError(err) &&
            (err.response?.data?.detail ?? err.response?.data)) ??
          'Error desconocido'
        dispatch({
          type: 'SET_LOGIN_ERROR',
          payload: { loginError: String(detail) }
        })
        console.error('Login error:', err)
      }
    },
    [handleUser]
  )

  const renewToken = useCallback(async () => {
    try {
      const stored = await EncryptedStorage.getItem(USER_STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : null
      if (!parsed?.refresh) {
        await EncryptedStorage.removeItem(USER_STORAGE_KEY)
        dispatch({ type: 'REMOVE_USER' })
        throw new Error('No refresh token available')
      }
      const result = await axios.post(`${API_URL}/auth/token/refresh/`, {
        refresh: parsed.refresh
      })
      const newUser = { ...parsed, access: result.data.access }
      await EncryptedStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      dispatch({ type: 'SET_USER', payload: { user: newUser } })
      return { access: result.data.access }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      try {
        await EncryptedStorage.removeItem(USER_STORAGE_KEY)
      } catch {}
      dispatch({ type: 'REMOVE_USER' })
      throw error
    }
  }, [])

  const verifyToken = useCallback(async (token: string) => {
    if (!token) return false
    try {
      await axios.post(`${API_URL}/auth/token/verify/`, { token })
      return true
    } catch {
      return false
    }
  }, [])

  const validateUser = useCallback(async () => {
    try {
      const stored = await EncryptedStorage.getItem(USER_STORAGE_KEY)
      if (!stored) {
        dispatch({ type: 'REMOVE_USER' })
        return
      }
      const user = JSON.parse(stored)
      const accessValid = await verifyToken(user.access)
      if (accessValid) {
        dispatch({ type: 'SET_USER', payload: { user } })
        return
      }
      const refreshValid = await verifyToken(user.refresh)
      if (refreshValid) {
        await renewToken()
        return
      }
      try {
        await EncryptedStorage.removeItem(USER_STORAGE_KEY)
      } catch {}
      dispatch({ type: 'REMOVE_USER' })
    } catch (e) {
      console.error(e)
      dispatch({ type: 'REMOVE_USER' })
    }
  }, [renewToken, verifyToken])

  useEffect(() => {
    validateUser()
  }, [validateUser])

  const logout = useCallback(async () => {
    try {
      await EncryptedStorage.removeItem(USER_STORAGE_KEY)
    } catch {}
    dispatch({ type: 'REMOVE_USER' })
    router.replace('/auth/login')
  }, [router])

  const value = useMemo(
    () => ({
      user: state.user,
      loginWithPassword,
      logout,
      renewToken,
      loading: state.loading,
      loginError: state.loginError
    }),
    [
      state.user,
      state.loading,
      state.loginError,
      loginWithPassword,
      logout,
      renewToken
    ]
  )

  if (state.loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => React.useContext(AuthContext)
