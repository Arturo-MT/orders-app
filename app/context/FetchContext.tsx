import React, { createContext, useContext, useMemo } from 'react'
import axios, { AxiosInstance } from 'axios'
import { useAuth } from './AuthContext'

const FetchContext = createContext<FetchContextType>({ client: axios.create() })

import { ReactNode } from 'react'
import { FetchContextType } from '@/types/types'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const FetchProvider = ({ children }: { children: ReactNode }) => {
  const { user, renewToken } = useAuth()

  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL
    })

    let isRefreshing = false
    let failedQueue: any[] = []

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve(token)
        }
      })
      failedQueue = []
    }

    instance.interceptors.request.use(
      (config) => {
        if (user?.access) {
          config.headers.Authorization = `Bearer ${user.access}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 403 || error.response?.status === 401) {
          if (originalRequest._retry) {
            return Promise.reject(error)
          }

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then((token) => {
              const accessToken = token as string
              originalRequest.headers.Authorization = 'Bearer ' + accessToken
              originalRequest._retry = true
              return instance(originalRequest)
            })
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            const { access } = await renewToken()
            processQueue(null, access)
            originalRequest.headers.Authorization = 'Bearer ' + access
            return instance(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )

    return instance
  }, [user?.access, renewToken])

  return (
    <FetchContext.Provider value={{ client: authAxios }}>
      {children}
    </FetchContext.Provider>
  )
}

export const useFetch = () => useContext(FetchContext)
