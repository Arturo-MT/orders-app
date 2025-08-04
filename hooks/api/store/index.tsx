import { useFetch } from '@/app/context/FetchContext'
import { storeQuery } from './queries'
import { STORE_KEY } from './constants'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { StoreConfig } from '@/types/types'
import { storeUpdateMutation } from './mutations'
import { useUserQuery } from '../users'

export function useStoreQuery(config = {}) {
  const { client } = useFetch()
  const { data: userData } = useUserQuery()
  return useQuery({
    queryKey: [STORE_KEY],
    queryFn: () => storeQuery({ id: userData?.store, client }),
    ...config
  })
}

export function useStoreUpdateMutation(config = {}) {
  const { client } = useFetch()
  const { data: userData } = useUserQuery()
  return useMutation({
    mutationFn: (payload: StoreConfig) =>
      storeUpdateMutation({ client, payload, id: userData?.store }),
    ...config
  })
}

export function useInvalidateStore() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [STORE_KEY] })
  }
}
