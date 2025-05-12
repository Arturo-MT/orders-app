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
      return { ...state, user: null, loading: true }
    case 'SET_USER':
      return { ...state, user: action.payload.user, loading: false }
    case 'REMOVE_USER':
      EncryptedStorage.removeItem(USER_STORAGE_KEY)
      return { ...state, user: null, loading: false }
    case 'SET_LOGIN_ERROR':
      return { ...state, loginError: action.payload.loginError, loading: false }
    default:
      throw new Error('Action not supported')
  }
}

const initialState = {
  user: null,
  loginWithPassword: async () => {},
  logout: () => {},
  loading: true,
  renewToken: async () => {},
  loginError: null,
  registerUser: async () => {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleUser = async (res: { data: UserResponseData | null }) => {
    if (!res.data) {
      console.error('Response is null')
      return
    }

    const storedUser = await EncryptedStorage.getItem(USER_STORAGE_KEY)
    const parsedUser: UserResponseData = storedUser
      ? JSON.parse(storedUser)
      : {}

    const user: UserResponseData = { ...parsedUser, ...res.data }

    await EncryptedStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    dispatch({ type: 'SET_USER', payload: { user } })
  }

  const loginWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      dispatch({ type: 'FETCH_USER' })

      try {
        const result = await axios.post(`${API_URL}/auth/token/`, {
          email,
          password
        })
        await handleUser(result)
        dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: null } })
      } catch (error) {
        const detail =
          (axios.isAxiosError(error) && error.response?.data?.detail) ??
          'Error desconocido'
        dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: detail } })
        console.error('Login error:', error)
      }
    },
    [router]
  )

  /*   const registerUser = useCallback(
    async ({
      username,
      email,
      password
    }: {
      username: string
      email: string
      password: string
    }) => {
      dispatch({ type: 'FETCH_USER' })

      try {
        const result = await axios.post(`${API_URL}/users/create/`, {
          username,
          email,
          password
        })
        await handleUser(result)
        dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: null } })
        router.replace('/tabs/new-order')
      } catch (error) {
        const detail =
          (error as any)?.response?.data?.detail ?? 'Error desconocido'
        dispatch({ type: 'SET_LOGIN_ERROR', payload: { loginError: detail } })
      }
    },
    [router]
  ) */

  const renewToken = useCallback(async () => {
    const storedUser = await EncryptedStorage.getItem(USER_STORAGE_KEY)
    const parsedUser = storedUser ? JSON.parse(storedUser) : null

    if (!parsedUser?.refresh) {
      console.warn('❌ No refresh token available')
      throw new Error('No refresh token available')
    }

    try {
      const result = await axios.post(`${API_URL}/auth/token/refresh/`, {
        refresh: parsedUser.refresh
      })

      await handleUser(result)

      console.log('✅ Token refreshed successfully')

      return { access: result.data.access }
    } catch (error) {
      console.error('❌ Failed to refresh token:', error)
      dispatch({ type: 'REMOVE_USER' })
      throw error
    }
  }, [dispatch])

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
    const storedUserString = await EncryptedStorage.getItem(USER_STORAGE_KEY)
    if (!storedUserString) {
      dispatch({ type: 'REMOVE_USER' })
      return
    }

    const user = JSON.parse(storedUserString)
    const isAccessTokenValid = await verifyToken(user.access)
    if (isAccessTokenValid) {
      dispatch({ type: 'SET_USER', payload: { user } })
      return
    }

    const isRefreshTokenValid = await verifyToken(user.refresh)
    if (isRefreshTokenValid) {
      return renewToken()
    }

    dispatch({ type: 'REMOVE_USER' })
  }, [renewToken, verifyToken])

  useEffect(() => {
    validateUser()
  }, [validateUser])

  const logout = useCallback(() => {
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
      // registerUser
    }),
    [
      state.user,
      state.loading,
      renewToken,
      logout,
      loginWithPassword,
      state.loginError
      // registerUser
    ]
  )

  if (state.loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => React.useContext(AuthContext)
