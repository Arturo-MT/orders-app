import { AxiosInstance } from 'axios'

export type SummaryQueryParams = {
  client: AxiosInstance
  period: 'day' | 'week' | 'month' | 'year'
  date: string
}

export async function summaryQuery({
  client,
  period,
  date
}: SummaryQueryParams) {
  const { data } = await client.get('/summary/', {
    params: { period, date }
  })

  return data
}
