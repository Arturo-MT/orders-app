import { useFetch } from '@/app/context/FetchContext'
import { storeQuery } from './queries'
import { STORE_KEY } from './constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useInvalidateStore() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [STORE_KEY] })
  }
}
