import { AxiosInstance } from 'axios'

export async function ordersQuery({ client }: { client: AxiosInstance }) {
  const { data } = await client.get('/orders/')
  return data
}

export async function orderQuery({
  client,
  id
}: {
  client: AxiosInstance
  id: number
}) {
  const { data } = await client.get(`/orders/${id}/`)
  return data
}
