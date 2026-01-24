import { SupabaseClient } from '@supabase/supabase-js'

export async function summaryQuery({
  client,
  period,
  date
}: {
  client: SupabaseClient
  period: 'day' | 'week' | 'month' | 'year'
  date: string
}) {
  const { data, error } = await client.rpc('get_summary', {
    p_period: period,
    p_date: date
  })

  if (error) throw error
  return data
}
