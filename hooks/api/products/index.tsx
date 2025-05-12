import { useFetch } from '@/app/context/FetchContext'
import { useQuery } from '@tanstack/react-query'
import { PRODUCTS_KEY } from './constants'
import { productsQuery } from './queries'

export function useProductsQuery(config = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [PRODUCTS_KEY],
    queryFn: () => productsQuery({ client }),
    ...config
  })
}
