import { useFetch } from '@/app/context/FetchContext'
import { storeQuery } from './queries'
import { STORE_KEY } from './constants'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { StoreConfig } from '@/types/types'
import { storeUpdateMutation } from './mutations'
import { useStore } from '@/app/context/StoreContext'

export function useStoreQuery(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  return useQuery({
    queryKey: [STORE_KEY, activeStore],
    enabled: !!activeStore,
    queryFn: () => storeQuery({ client, id: activeStore!.id }),
    ...config
  })
}

export function useStoreUpdateMutation(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()

  return useMutation({
    mutationFn: (payload: StoreConfig) => {
      return storeUpdateMutation({
        client,
        payload,
        id: activeStore!.id
      })
    },
    ...config
  })
}

export function useInvalidateStore() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [STORE_KEY] })
  }
}
