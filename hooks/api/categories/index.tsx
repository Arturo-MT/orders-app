import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useQuery } from '@tanstack/react-query'
import { categoriesQuery } from './queries'
import { CATEGORIES_KEY } from './constants'

export function useCategoriesQuery(config = {}) {
  const { client } = useFetch()
  const { store, loading: storeLoading } = useStore()

  return useQuery({
    queryKey: [CATEGORIES_KEY, store?.id],
    enabled: !!store?.id && !storeLoading,
    queryFn: () =>
      categoriesQuery({
        client,
        storeId: store!.id
      }),
    ...config
  })
}
