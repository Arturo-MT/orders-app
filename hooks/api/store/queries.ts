import { SupabaseClient } from '@supabase/supabase-js'

export type Store = {
  id: string
  name: string
}

export async function storeQuery({
  id,
  client
}: {
  id: string
  client: SupabaseClient
}) {
  const { data, error } = await client
    .from('store')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function userStoresQuery({
  client,
  userId
}: {
  client: SupabaseClient
  userId: string
}): Promise<Store[]> {
  const { data, error } = await client
    .from('store_member')
    .select('store(id, name)')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw error

  return (data ?? [])
    .map((row: any) => row.store)
    .filter(Boolean) as Store[]
}
