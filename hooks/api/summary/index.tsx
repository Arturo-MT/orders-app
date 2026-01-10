import { useFetch } from '@/app/context/FetchContext'
import { useQuery } from '@tanstack/react-query'
import { summaryQuery } from './queries'

export type SummaryParams = {
  period: 'day' | 'week' | 'month' | 'year'
  date: string
}

const SUMMARY_KEY = 'summary'

export function useSummaryQuery(params: SummaryParams | null) {
  const { client } = useFetch()

  return useQuery({
    queryKey: params
      ? [SUMMARY_KEY, params.period, params.date]
      : [SUMMARY_KEY],
    queryFn: () => {
      if (!params) {
        throw new Error('No params')
      }

      return summaryQuery({
        client,
        period: params.period,
        date: params.date
      })
    },
    enabled: !!params
  })
}
