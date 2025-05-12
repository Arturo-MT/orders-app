import { useFetch } from '@/app/context/FetchContext'
import { useQuery } from '@tanstack/react-query'
import { USER_KEY } from './constants'
import { userQuery } from './queries'

export function useUserQuery(config = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [USER_KEY],
    queryFn: () => userQuery({ client }),
    ...config
  })
}
