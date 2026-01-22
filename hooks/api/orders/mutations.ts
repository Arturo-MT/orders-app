import { SupabaseClient } from '@supabase/supabase-js'
import { OrderDraft } from '@/types/types'

async function findOpenOrderByTable(client: SupabaseClient, tableId: string) {
  const { data, error } = await client
    .from('order')
    .select('id')
    .eq('table_id', tableId)
    .eq('status', 'OPEN')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function orderCreate({
  client,
  payload,
  storeId
}: {
  client: SupabaseClient
  payload: OrderDraft
  storeId: string
}) {
  let orderId: string

  if (payload.type === 'DINE_IN') {
    if (!payload.table_id) {
      throw new Error('DINE_IN requiere table_id')
    }

    const openOrder = await findOpenOrderByTable(client, payload.table_id)

    if (openOrder) {
      orderId = openOrder.id
    } else {
      const { data, error } = await client.rpc('create_dine_in_order', {
        p_store_id: storeId,
        p_table_id: payload.table_id
      })

      if (error) throw error
      orderId = data.order_id
    }
  } else {
    const { data, error } = await client.rpc('create_takeaway_order', {
      p_store_id: storeId,
      p_customer_name: payload.customer_name
    })

    if (error) throw error
    orderId = data.order_id
  }

  const { error: itemsError } = await client.rpc('add_items_to_order', {
    p_order_id: orderId,
    p_items: payload.items
  })

  if (itemsError) throw itemsError

  return {
    order_id: orderId
  }
}
