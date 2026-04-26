import { SupabaseClient } from '@supabase/supabase-js'

export async function createCategory({
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

export async function updateCategory({
  client,
  storeId,
  id,
  name,
  isActive
}: {
  client: SupabaseClient
  storeId: string
  id: string
  name?: string
  isActive?: boolean
}) {
  const payload: Record<string, any> = {}

  if (name !== undefined) payload.name = name
  if (isActive !== undefined) payload.is_active = isActive

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
