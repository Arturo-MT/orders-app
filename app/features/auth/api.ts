import axios from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'

const api = axios.create({
  baseURL: 'http:192.168.50.163:8000/api'
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

api.interceptors.request.use(async (config) => {
  const stored = await EncryptedStorage.getItem('auth')
  const { accessToken } = stored ? JSON.parse(stored) : {}
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

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
        const stored = await EncryptedStorage.getItem('auth')
        const { refreshToken } = stored ? JSON.parse(stored) : {}

        const { data } = await axios.post(
          'http://192.168.50.163:8000/api/auth/token/refresh',
          {
            refreshToken
          }
        )

        await EncryptedStorage.setItem(
          'auth',
          JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user
          })
        )

        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        processQueue(null, data.accessToken)

        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
