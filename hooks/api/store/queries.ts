import { AxiosInstance } from 'axios'

export async function storeQuery({
  id,
  client
}: {
  id: number
  client: AxiosInstance
}) {
  const { data } = await client.get(`/stores/${id}/`)
  return data
}
