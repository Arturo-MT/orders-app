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

export type OrderCreateResponse = {
  order_id: string
  order_number: string
}

export async function orderCreate({
  client,
  payload,
  storeId
}: {
  client: SupabaseClient
  payload: OrderDraft
  storeId: string
}): Promise<OrderCreateResponse> {
  let orderId: string
  let orderNumber: string

  // =========================
  // DINE_IN
  // =========================
  if (payload.type === 'DINE_IN') {
    if (!payload.table_id) {
      throw new Error('DINE_IN requiere table_id')
    }

    const openOrder = await findOpenOrderByTable(client, payload.table_id)

    if (openOrder) {
      orderId = openOrder.id

      // obtener order_number de la orden abierta
      const { data, error } = await client
        .from('order')
        .select('order_number')
        .eq('id', orderId)
        .single()

      if (error) throw error
      orderNumber = data.order_number
    } else {
      const { data, error } = await client.rpc('create_dine_in_order', {
        p_store_id: storeId,
        p_table_id: payload.table_id
      })

      if (error) throw error

      orderId = data.order_id
      orderNumber = data.order_number
    }
  }

  // =========================
  // TAKEAWAY
  // =========================
  else {
    const { data, error } = await client.rpc('create_takeaway_order', {
      p_store_id: storeId,
      p_customer_name: payload.customer_name
    })

    if (error) throw error

    orderId = data.order_id
    orderNumber = data.order_number
  }

  // =========================
  // AGREGAR ITEMS
  // =========================
  const { error: itemsError } = await client.rpc('add_items_to_order', {
    p_order_id: orderId,
    p_items: payload.items
  })

  if (itemsError) throw itemsError

  // =========================
  // RESPUESTA FINAL
  // =========================
  return {
    order_id: orderId,
    order_number: orderNumber
  }
}
