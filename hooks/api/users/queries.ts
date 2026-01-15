import { SupabaseClient } from '@supabase/supabase-js'

export async function userQuery({
  client,
  userId
}: {
  client: SupabaseClient
  userId: string
}): Promise<any> {
  const { data, error } = await client
    .from('store_member')
    .select('role, store(id, name)')
    .eq('user_id', userId)

  if (error) throw error

  return data
}
