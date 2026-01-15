import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useQuery } from '@tanstack/react-query'
import { PRODUCTS_KEY } from './constants'
import { productsQuery } from './queries'

export function useProductsQuery(config = {}) {
  const { client } = useFetch()
  const { store, loading } = useStore()

  return useQuery({
    queryKey: [PRODUCTS_KEY, store?.id],
    enabled: !!store?.id && !loading,
    queryFn: () =>
      productsQuery({
        client,
        storeId: store!.id
      }),
    ...config
  })
}
