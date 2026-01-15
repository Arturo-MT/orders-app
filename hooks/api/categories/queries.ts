import { SupabaseClient } from '@supabase/supabase-js'

export async function categoriesQuery({
  client,
  storeId
}: {
  client: SupabaseClient
  storeId: string
}) {
  const { data, error } = await client
    .from('product_category')
    .select('*')
    .eq('is_active', true)
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  console.log('Categories data:', data, 'Store ID:', storeId)

  if (error) {
    throw error
  }

  return data
}
