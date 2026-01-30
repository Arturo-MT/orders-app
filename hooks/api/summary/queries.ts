import { SupabaseClient } from '@supabase/supabase-js'

export async function summaryQuery({
  client,
  period,
  date,
  storeId
}: {
  client: SupabaseClient
  period: 'day' | 'week' | 'month' | 'year'
  date: string
  storeId: string
}) {
  const { data, error } = await client
    .rpc('get_summary', {
      p_period: period,
      p_date: date
    })
    .eq('store_id', storeId)

  if (error) throw error
  return data
}
