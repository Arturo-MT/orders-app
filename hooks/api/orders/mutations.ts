import { Order, OrderUpdate } from '@/types/types'
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

export async function orderUpdateMutation({
  client,
  payload,
  id
}: {
  client: AxiosInstance
  payload: OrderUpdate
  id: number
}) {
  const { data } = await client.patch<OrderUpdate>(`/orders/${id}/`, payload)
  return data
}
