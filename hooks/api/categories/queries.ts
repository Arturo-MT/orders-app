import { SupabaseClient } from '@supabase/supabase-js'

export async function categoriesQuery({
  client,
  storeId,
  showAll = false
}: {
  client: SupabaseClient
  storeId: string
  showAll?: boolean
}) {
  let query = client
    .from('product_category')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (!showAll) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}
