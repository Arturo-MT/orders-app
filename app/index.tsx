import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user !== undefined) {
      setTimeout(() => {
        const target = user ? '/tabs/pos' : '/auth/login'
        router.replace(target)
      }, 0)
    }
  }, [loading, user])

  return null
}
