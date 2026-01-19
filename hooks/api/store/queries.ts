import { SupabaseClient } from '@supabase/supabase-js'

export async function storeQuery({
  id,
  client
}: {
  id: string
  client: SupabaseClient
}) {
  const { data, error } = await client
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
