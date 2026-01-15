import { useFetch } from '@/app/context/FetchContext'
import { useAuth } from '@/app/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { USER_KEY } from './constants'
import { userQuery } from './queries'

export function useUserQuery(config = {}) {
  const { client } = useFetch()
  const { user } = useAuth()

  return useQuery({
    queryKey: [USER_KEY, user?.id],
    enabled: !!user?.id,
    queryFn: () => userQuery({ client, userId: user!.id }),
    ...config
  })
}
