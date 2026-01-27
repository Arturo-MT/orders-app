import { StoreConfig } from '@/types/types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function storeUpdateMutation({
  client,
  payload,
  id
}: {
  client: SupabaseClient
  payload: StoreConfig
  id: string
}) {
  const { data, error } = await client
    .from('store')
    .update(payload)
    .eq('id', id)
    .select()
  console.log(data, error, payload)
  if (error) throw error
  return data
}
