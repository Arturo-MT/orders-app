import { useFetch } from '@/context/FetchContext'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { USER_KEY } from './constants'
import { userQuery } from './queries'
import { useStore } from '@/context/StoreContext'

export function useUserQuery(config = {}) {
  const { client } = useFetch()
  const { user } = useAuth()
  const { activeStore } = useStore()

  return useQuery({
    queryKey: [USER_KEY, user?.id, activeStore?.id],
    enabled: !!user?.id && !!activeStore?.id,
    queryFn: () =>
      userQuery({ client, userId: user!.id, storeId: activeStore!.id }),
    ...config
  })
}
