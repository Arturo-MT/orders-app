import { SupabaseClient } from '@supabase/supabase-js'

export async function createTable({
  client,
  storeId,
  name
}: {
  client: SupabaseClient
  storeId: string
  name: string
}) {
  const { data, error } = await client
    .from('dining_table')
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

export async function updateTable({
  client,
  storeId,
  id,
  name,
  isActive,
  isOccupied
}: {
  client: SupabaseClient
  storeId: string
  id: string
  name?: string
  isActive?: boolean
  isOccupied?: boolean
}) {
  const payload: Record<string, any> = {}

  if (name !== undefined) payload.name = name
  if (isActive !== undefined) payload.is_active = isActive
  if (isOccupied !== undefined) payload.is_occupied = isOccupied

  const { data, error } = await client
    .from('dining_table')
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
