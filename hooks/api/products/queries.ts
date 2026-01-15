import { SupabaseClient } from '@supabase/supabase-js'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  is_active: boolean
}

export async function productsQuery({
  client,
  storeId
}: {
  client: SupabaseClient
  storeId: string
}): Promise<Product[]> {
  const { data, error } = await client
    .from('product')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw error
  }

  return data ?? []
}
