import {
  useQuery,
  keepPreviousData,
  useQueryClient
} from '@tanstack/react-query'
import { useFetch } from '@/app/context/FetchContext'
import { dashboardQuery } from './queries'
import { DASHBOARD_KEY } from './constants'

export function useDashboardQuery({ search = '', page = 1 } = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [DASHBOARD_KEY, search, page],
    queryFn: () => dashboardQuery({ client, search, page }),
    placeholderData: keepPreviousData
  })
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
  }
}
