import { useFetch } from '@/app/context/FetchContext'
import { storeQuery } from './queries'
import { STORE_KEY } from './constants'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { StoreConfig } from '@/types/types'
import { storeUpdateMutation } from './mutations'
import { useStore } from '@/app/context/StoreContext'

export function useStoreQuery(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  return useQuery({
    queryKey: [STORE_KEY, store],
    enabled: !!store,
    queryFn: () => storeQuery({ client, id: store!.id }),
    ...config
  })
}

export function useStoreUpdateMutation(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()

  return useMutation({
    mutationFn: (payload: StoreConfig) => {
      return storeUpdateMutation({
        client,
        payload,
        id: store!.id
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
