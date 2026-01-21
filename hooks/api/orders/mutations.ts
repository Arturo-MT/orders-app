import { SupabaseClient } from '@supabase/supabase-js'
import { OrderDraft } from '@/types/types'

export async function orderCreate({
  client,
  payload,
  storeId
}: {
  client: SupabaseClient
  payload: OrderDraft
  storeId: string
}) {
  const { data, error } = await client.rpc('create_order_from_draft', {
    p_store_id: storeId,
    p_order: payload
  })

  if (error) throw error
  return data
}
