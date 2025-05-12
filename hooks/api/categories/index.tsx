import { useFetch } from '@/app/context/FetchContext'
import { useQuery } from '@tanstack/react-query'
import { categoriesQuery } from './queries'
import { CATEGORIES_KEY } from './constants'

export function useCategoriesQuery(config = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => categoriesQuery({ client }),
    ...config
  })
}
