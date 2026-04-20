import { SupabaseClient } from '@supabase/supabase-js'
import { OrderDraft } from '@/types/types'

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

  return { order_id: orderId, order_number: orderNumber }
}

export async function closeOrder({
  client,
  orderId,
  tableId
}: {
  client: SupabaseClient
  orderId: string
  tableId?: string | null
}) {
  const { data, error } = await client
    .from('order')
    .update({
      status: 'CLOSED',
      payment_status: 'PAID',
      closed_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se cerró ninguna orden (0 rows affected)')
  }

  if (tableId) {
    const { error: tableError } = await client
      .from('dining_table')
      .update({ is_occupied: false })
      .eq('id', tableId)

    if (tableError) throw tableError
  }
}

export async function changeOrderTable({
  client,
  orderId,
  oldTableId,
  newTableId
}: {
  client: SupabaseClient
  orderId: string
  oldTableId: string | null
  newTableId: string
}) {
  const { error } = await client
    .from('order')
    .update({ table_id: newTableId })
    .eq('id', orderId)

  if (error) throw error

  if (oldTableId) {
    const { error: oldTableError } = await client
      .from('dining_table')
      .update({ is_occupied: false })
      .eq('id', oldTableId)

    if (oldTableError) throw oldTableError
  }

  const { error: newTableError } = await client
    .from('dining_table')
    .update({ is_occupied: true })
    .eq('id', newTableId)

  if (newTableError) throw newTableError
}

export async function reopenOrder({
  client,
  orderId,
  tableId,
  preparedAt,
  dispatchedAt
}: {
  client: SupabaseClient
  orderId: string
  tableId?: string | null
  preparedAt?: string | null
  dispatchedAt?: string | null
}) {
  const status = dispatchedAt ? 'DISPATCHED' : preparedAt ? 'PREPARING' : 'OPEN'

  const { error } = await client
    .from('order')
    .update({ status, payment_status: 'PENDING', closed_at: null })
    .eq('id', orderId)

  if (error) throw error

  if (tableId) {
    const { error: tableError } = await client
      .from('dining_table')
      .update({ is_occupied: true })
      .eq('id', tableId)

    if (tableError) throw tableError
  }
}
