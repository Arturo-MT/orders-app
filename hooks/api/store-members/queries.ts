import { SupabaseClient } from '@supabase/supabase-js'

export async function storeMembersQuery(
  client: SupabaseClient,
  storeId: string
) {
  const { data, error } = await client.rpc('get_store_members', {
    p_store_id: storeId
  })

  if (error) throw error
  return data
}
