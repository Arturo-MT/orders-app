import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesQuery } from './queries'
import { TABLES_KEY } from './constants'
import { createTableMutation, updateTableMutation } from './mutations'

export function useTablesQuery(config = {}) {
  const { client } = useFetch()
  const { store, loading: storeLoading } = useStore()

  return useQuery({
    queryKey: [TABLES_KEY, store?.id],
    enabled: !!store?.id && !storeLoading,
    queryFn: () =>
      tablesQuery({
        client,
        storeId: store!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateTable(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      createTableMutation({
        client,
        storeId: store!.id,
        name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TABLES_KEY, store?.id]
      })
    },
    ...config
  })
}

export function useUpdateTable(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; name?: string; is_active?: boolean }) =>
      updateTableMutation({
        client,
        storeId: store!.id,
        ...input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TABLES_KEY, store?.id]
      })
    },
    ...config
  })
}
