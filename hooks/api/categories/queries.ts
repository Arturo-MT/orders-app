import { AxiosInstance } from 'axios'

export async function categoriesQuery({ client }: { client: AxiosInstance }) {
  const { data } = await client.get('/product-categories/')
  return data
}
