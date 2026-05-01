import { useFetch } from '@/context/FetchContext'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface UseRealtimeInvalidateParams {
  table: string
  filter: string | undefined
  queryKey: unknown[]
  enabled?: boolean
}

export function useRealtimeInvalidate({
  table,
  filter,
  queryKey,
  enabled = true
}: UseRealtimeInvalidateParams) {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !filter) return

    const channel = client
      .channel(`realtime:${table}:${filter}:${queryKey[0]}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        () => { queryClient.invalidateQueries({ queryKey }) }
      )
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [enabled, filter, table])
}
