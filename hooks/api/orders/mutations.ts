import { SupabaseClient } from '@supabase/supabase-js'
import { OrderDraft } from '@/types/types'

export type OrderCreateResponse = {
  order_id: string
  order_number: string
}

export async function findOpenOrderByTable(
  client: SupabaseClient,
  tableId: string
): Promise<{ id: string; order_number: string } | null> {
  const { data, error } = await client
    .from('order')
    .select('id, order_number')
    .eq('table_id', tableId)
    .eq('status', 'OPEN')
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
}): Promise<OrderCreateResponse> {
  let orderId: string
  let orderNumber: string

  if (payload.type === 'DINE_IN') {
    const hasTable = !!payload.table_id
    const hasCustomerName = !!payload.customer_name?.trim()

    if (!hasTable && !hasCustomerName) {
      throw new Error('DINE_IN requiere mesa o nombre del cliente')
    }

    const { data, error }: any = await client
      .rpc('create_order', {
        p_store_id: storeId,
        p_type: 'DINE_IN',
        p_table_id: hasTable ? payload.table_id : null,
        p_customer_name: hasCustomerName ? payload.customer_name : null,
        p_status: 'OPEN',
        p_payment_status: payload.is_paid ? 'PAID' : 'PENDING'
      })
      .single()

    if (error) throw error

    orderId = data.order_id
    orderNumber = data.order_number
  }

  // =========================
  // TAKEAWAY
  // =========================
  else {
    const hasCustomerName = !!payload.customer_name?.trim()

    if (!hasCustomerName) {
      throw new Error('TAKEAWAY requiere nombre del cliente')
    }

    const { data, error }: any = await client
      .rpc('create_order', {
        p_store_id: storeId,
        p_type: 'TAKEAWAY',
        p_table_id: null,
        p_customer_name: payload.customer_name,
        p_status: 'OPEN',
        p_payment_status: payload.is_paid ? 'PAID' : 'PENDING'
      })
      .single()

    if (error) throw error

    orderId = data.order_id
    orderNumber = data.order_number
  }

  const { error: itemsError } = await client.rpc('add_items_to_order', {
    p_order_id: orderId,
    p_items: payload.items
  })

  if (itemsError) throw itemsError

  return {
    order_id: orderId,
    order_number: orderNumber
  }
}
