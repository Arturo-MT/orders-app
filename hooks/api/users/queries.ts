import { AxiosInstance } from 'axios'

export async function userQuery({ client }: { client: AxiosInstance }) {
  const { data } = await client.get(`/auth/me/`)
  return data
}
