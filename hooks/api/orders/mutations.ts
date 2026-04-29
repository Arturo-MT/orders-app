import { SupabaseClient } from '@supabase/supabase-js'
import { OrderDraft } from '@/types/types'

export type CreateOrderResponse = {
  order_id: string
  order_number: string
}

export type OrderUpdatePatch = Partial<{
  status: 'OPEN' | 'PREPARING' | 'DISPATCHED' | 'CLOSED' | 'SCHEDULED'
  payment_status: 'PAID' | 'PENDING'
  table_id: string | null
  closed_at: string | null
  prepared_at: string | null
  dispatched_at: string | null
  scheduled_for: string | null
}>

export async function createOrder({
  client,
  payload,
  storeId
}: {
  client: SupabaseClient
  payload: OrderDraft
  storeId: string
}): Promise<CreateOrderResponse> {
  let orderId: string
  let orderNumber: string

  const isScheduled = !!payload.scheduled_for
  const orderStatus = isScheduled ? 'SCHEDULED' : 'OPEN'

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
        p_status: orderStatus,
        p_payment_status: payload.is_paid ? 'PAID' : 'PENDING',
        p_scheduled_for: payload.scheduled_for ?? null
      })
      .single()

    if (error) throw error

    orderId = data.order_id
    orderNumber = data.order_number
  } else {
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
        p_status: orderStatus,
        p_payment_status: payload.is_paid ? 'PAID' : 'PENDING',
        p_scheduled_for: payload.scheduled_for ?? null
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

  return { order_id: orderId, order_number: orderNumber }
}

export async function updateOrder({
  client,
  orderId,
  patch
}: {
  client: SupabaseClient
  orderId: string
  patch: OrderUpdatePatch
}) {
  const { data, error } = await client
    .from('order')
    .update(patch)
    .eq('id', orderId)
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se actualizó ninguna orden (0 rows affected)')
  }
  return data[0]
}
