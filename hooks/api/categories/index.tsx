import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesQuery } from './queries'
import { CATEGORIES_KEY } from './constants'
import { createCategoryMutation, updateCategoryMutation } from './mutations'

export function useCategoriesQuery(config = {}) {
  const { client } = useFetch()
  const { store, loading: storeLoading } = useStore()

  return useQuery({
    queryKey: [CATEGORIES_KEY, store?.id],
    enabled: !!store?.id && !storeLoading,
    queryFn: () =>
      categoriesQuery({
        client,
        storeId: store!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateCategory(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      createCategoryMutation({
        client,
        storeId: store!.id,
        name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_KEY, store?.id]
      })
    },
    ...config
  })
}

export function useUpdateCategory(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; name?: string; is_active?: boolean }) =>
      updateCategoryMutation({
        client,
        storeId: store!.id,
        ...input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_KEY, store?.id]
      })
    },
    ...config
  })
}
