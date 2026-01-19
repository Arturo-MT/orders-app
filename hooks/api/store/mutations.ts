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
    .from('stores')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
