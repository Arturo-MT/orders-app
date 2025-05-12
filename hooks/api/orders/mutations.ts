import { Order } from '@/types/types'
import { AxiosInstance } from 'axios'

export async function ordersMutation({
  client,
  payload
}: {
  client: AxiosInstance
  payload: Order
}) {
  const { data } = await client.post('/create-order/', payload)
  return data
}
