import { AxiosInstance } from 'axios'

export async function productsQuery({ client }: { client: AxiosInstance }) {
  const { data } = await client.get('/products/')
  return data
}
