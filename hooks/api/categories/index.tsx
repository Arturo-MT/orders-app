import { useFetch } from '@/context/FetchContext'
import { useStore } from '@/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesQuery } from './queries'
import { CATEGORIES_KEY } from './constants'
import { createCategory, updateCategory } from './mutations'

export function useCategoriesQuery(config = {}) {
  const { client } = useFetch()
  const { activeStore, loading: storeLoading } = useStore()

  return useQuery({
    queryKey: [CATEGORIES_KEY, activeStore?.id],
    enabled: !!activeStore?.id && !storeLoading,
    queryFn: () =>
      categoriesQuery({
        client,
        storeId: activeStore!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateCategory(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      createCategory({
        client,
        storeId: activeStore!.id,
        name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_KEY, activeStore?.id]
      })
    },
    ...config
  })
}

export function useUpdateCategory(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; name?: string; isActive?: boolean }) =>
      updateCategory({
        client,
        storeId: activeStore!.id,
        ...input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_KEY, activeStore?.id]
      })
    },
    ...config
  })
}
