import axios from 'axios'
import { getAuth, setAuth, clearAuth } from './authStorage'

const API_URL = process.env.EXPO_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL
})

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (error: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  async (config) => {
    const auth = await getAuth()

    if (auth?.access) {
      config.headers.Authorization = `Bearer ${auth.access}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Si ya hay refresh en curso → cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      isRefreshing = true

      try {
        const auth = await getAuth()

        if (!auth?.refresh) {
          await clearAuth()
          return Promise.reject(error)
        }

        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: auth.refresh
        })

        const newAuth = {
          access: data.access,
          refresh: data.refresh
        }

        await setAuth(newAuth)

        api.defaults.headers.common.Authorization = `Bearer ${data.access}`
        originalRequest.headers.Authorization = `Bearer ${data.access}`

        processQueue(null, data.access)

        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        await clearAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
