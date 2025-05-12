import { AxiosInstance } from 'axios'

interface OrdersQueryParams {
  search?: string
  page?: number
  client: AxiosInstance
}

export async function dashboardQuery({
  client,
  search,
  page = 1
}: OrdersQueryParams) {
  const params = new URLSearchParams()

  if (search) params.append('search', search)
  if (page) params.append('page', page.toString())

  const { data } = await client.get(`/dashboard/?${params.toString()}`)
  return data
}
