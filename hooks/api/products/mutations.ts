import {
  ProductInput,
  ProductUpdateInput,
  ProductUpdatePayload
} from '@/types/types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function createProduct({
  client,
  storeId,
  payload
}: {
  client: SupabaseClient
  storeId: string
  payload: ProductInput
}) {
  const { data, error } = await client
    .from('product')
    .insert({
      ...payload,
      store_id: storeId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct({
  client,
  id,
  payload
}: {
  client: SupabaseClient
  id: string
  payload: ProductUpdatePayload
}) {
  const { data, error } = await client
    .from('product')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
