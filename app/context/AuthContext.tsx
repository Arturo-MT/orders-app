import React, { useReducer, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
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
      return { ...state, user: null, loading: false }

    case 'SET_LOGIN_ERROR':
      return {
        ...state,
        loginError: action.payload.loginError,
        loading: false
      }

    default:
      throw new Error('Action not supported')
  }
}

const saveUser = async (user: UserResponseData) => {
  await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user))
}

const getStoredUser = async (): Promise<UserResponseData | null> => {
  const stored = await SecureStore.getItemAsync(USER_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

const clearUser = async () => {
  await SecureStore.deleteItemAsync(USER_STORAGE_KEY)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const router = useRouter()

  const [state, dispatch] = useReducer(reducer, {
    user: null,
    loading: true,
    loginError: null
  })

  const handleUser = async (res: { data: UserResponseData | null }) => {
    if (!res.data) throw new Error('User response is null')

    const storedUser = await getStoredUser()
    const user: UserResponseData = {
      ...storedUser,
      ...res.data
    }

    await saveUser(user)
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
        dispatch({
          type: 'SET_LOGIN_ERROR',
          payload: { loginError: null }
        })
      } catch (error) {
        const detail =
          (axios.isAxiosError(error) && error.response?.data?.detail) ??
          'Error desconocido'

        dispatch({
          type: 'SET_LOGIN_ERROR',
          payload: { loginError: detail }
        })
      }
    },
    []
  )

  const renewToken = useCallback(async () => {
    const user = await getStoredUser()

    if (!user?.refresh) {
      await clearUser()
      dispatch({ type: 'REMOVE_USER' })
      throw new Error('No refresh token available')
    }

    const result = await axios.post(`${API_URL}/auth/token/refresh/`, {
      refresh: user.refresh
    })

    await handleUser(result)
    return result.data.access
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
    const user = await getStoredUser()

    if (!user) {
      dispatch({ type: 'REMOVE_USER' })
      return
    }

    if (user.access && (await verifyToken(user.access))) {
      dispatch({ type: 'SET_USER', payload: { user } })
      return
    }

    if (user.refresh && (await verifyToken(user.refresh))) {
      await renewToken()
      return
    }

    await clearUser()
    dispatch({ type: 'REMOVE_USER' })
  }, [renewToken, verifyToken])

  const logout = useCallback(async () => {
    await clearUser()
    dispatch({ type: 'REMOVE_USER' })
    router.replace('/auth/login')
  }, [router])

  useEffect(() => {
    validateUser()
  }, [validateUser])

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      loginError: state.loginError,
      loginWithPassword,
      logout,
      renewToken
    }),
    [state, loginWithPassword, logout, renewToken]
  )

  if (state.loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => React.useContext(AuthContext)
