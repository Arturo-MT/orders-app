import { SupabaseClient } from '@supabase/supabase-js'

export async function userQuery({
  client,
  userId,
  storeId
}: {
  client: SupabaseClient
  userId: string
  storeId: string
}): Promise<any> {
  const { data, error } = await client
    .from('store_member')
    .select('role, store(id, name)')
    .eq('user_id', userId)
    .eq('store_id', storeId)

  if (error) throw error

  return data
}
