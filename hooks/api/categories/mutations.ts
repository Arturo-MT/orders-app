import { SupabaseClient } from '@supabase/supabase-js'

export async function createCategoryMutation({
  client,
  storeId,
  name
}: {
  client: SupabaseClient
  storeId: string
  name: string
}) {
  const { data, error } = await client
    .from('product_category')
    .insert({
      store_id: storeId,
      name
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategoryMutation({
  client,
  storeId,
  id,
  name,
  is_active
}: {
  client: SupabaseClient
  storeId: string
  id: string
  name?: string
  is_active?: boolean
}) {
  const payload: Record<string, any> = {}

  if (name !== undefined) payload.name = name
  if (is_active !== undefined) payload.is_active = is_active

  const { data, error } = await client
    .from('product_category')
    .update(payload)
    .eq('id', id)
    .eq('store_id', storeId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
