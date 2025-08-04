import { StoreConfig } from '@/types/types'
import { AxiosInstance } from 'axios'

export async function storeUpdateMutation({
  client,
  payload,
  id
}: {
  client: AxiosInstance
  payload: StoreConfig
  id: number
}) {
  const { data } = await client.patch<StoreConfig>(`/stores/${id}/`, payload)
  return data
}
