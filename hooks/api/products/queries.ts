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
  storeId,
  showAll = false
}: {
  client: SupabaseClient
  storeId: string
  showAll?: boolean
}): Promise<Product[]> {
  let query = client
    .from('product')
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

  return data ?? []
}
