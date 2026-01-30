import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesQuery } from './queries'
import { TABLES_KEY } from './constants'
import { createTableMutation, updateTableMutation } from './mutations'

export function useTablesQuery(config = {}) {
  const { client } = useFetch()
  const { activeStore, loading: storeLoading } = useStore()

  return useQuery({
    queryKey: [TABLES_KEY, activeStore?.id],
    enabled: !!activeStore?.id && !storeLoading,
    queryFn: () =>
      tablesQuery({
        client,
        storeId: activeStore!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateTable(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      createTableMutation({
        client,
        storeId: activeStore!.id,
        name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TABLES_KEY, activeStore?.id]
      })
    },
    ...config
  })
}

export function useUpdateTable(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; name?: string; is_active?: boolean }) =>
      updateTableMutation({
        client,
        storeId: activeStore!.id,
        ...input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TABLES_KEY, activeStore?.id]
      })
    },
    ...config
  })
}
