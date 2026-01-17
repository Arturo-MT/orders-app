import { SupabaseClient } from '@supabase/supabase-js'

type StoreMemberUpdate = {
  role?: 'admin' | 'staff'
  is_active?: boolean
}

export async function createStoreMember({
  client,
  storeId,
  email,
  role = 'staff',
  is_active = true
}: {
  client: SupabaseClient
  storeId: string
  email: string
  role?: 'admin' | 'staff'
  is_active?: boolean
}) {
  const { data, error } = await client.rpc('create_store_member_by_email', {
    p_email: email,
    p_store_id: storeId,
    p_role: role,
    p_is_active: is_active
  })

  if (error) throw error

  console.log('Created store member:', data)
  return data
}

export async function updateStoreMember(input: {
  id: string
  storeId: string
  client: SupabaseClient
  role?: 'admin' | 'staff'
  is_active?: boolean
}) {
  const { client, storeId, id, role, is_active } = input

  const payload: StoreMemberUpdate = {}

  if (role !== undefined) payload.role = role
  if (is_active !== undefined) payload.is_active = is_active

  const { error } = await client
    .from('store_member')
    .update(payload)
    .eq('id', id)
    .eq('store_id', storeId)

  if (error) throw error
}
