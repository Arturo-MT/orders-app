import { SupabaseClient } from '@supabase/supabase-js'

export type OrderStatus = 'OPEN' | 'CLOSED' | 'PREPARING' | 'DISPATCHED'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING'

export type OpenOrderSummary = {
  id: string
  order_number: string
  type: 'DINE_IN' | 'TAKEAWAY'
  status: 'OPEN' | 'PREPARING' | 'DISPATCHED'
  payment_status: string | null
  customer_name: string | null
  table_id: string | null
  dining_table?: { id: string; name: string } | null
  table_name: string | null
  created_at: string
  opened_at?: string | null
}

export type OrderDetail = {
  id: string
  order_number: string
  type: 'DINE_IN' | 'TAKEAWAY'
  status: string
  payment_status: string | null
  customer_name: string | null
  table_name: string | null
  created_at: string
  opened_at: string | null
  closed_at: string | null
  dispatched_at: string | null
  prepared_at: string | null
  items: {
    id: string
    product_id: string
    product_name: string
    quantity: number
    base_price: number
    total_price: number
    notes: string | null
  }[]
}

export async function orderQuery({
  client,
  orderId
}: {
  client: SupabaseClient
  orderId: string
}): Promise<OrderDetail> {
  const { data, error } = await client
    .from('order')
    .select(
      `
        id,
        order_number,
        type,
        status,
        payment_status,
        customer_name,
        table_id,
        created_at,
        opened_at,
        closed_at,
        dispatched_at,
        prepared_at,
        dining_table ( name ),
        order_item (
          id,
          product_id,
          quantity,
          base_price,
          total_price,
          notes,
          product:product_id ( name )
        )
      `
    )
    .eq('id', orderId)
    .single()

  if (error) throw error

  return {
    id: data.id,
    order_number: data.order_number,
    type: data.type,
    status: data.status,
    payment_status: data.payment_status,
    customer_name: data.customer_name,
    table_name: (data.dining_table as any)?.name ?? null,
    created_at: data.created_at,
    opened_at: data.opened_at,
    closed_at: data.closed_at,
    dispatched_at: data.dispatched_at,
    prepared_at: data.prepared_at,
    items: data.order_item.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product?.name ?? '',
      quantity: item.quantity,
      base_price: item.base_price,
      total_price: item.total_price,
      notes: item.notes
    }))
  }
}

export async function openOrderIdsQuery({
  client,
  storeId
}: {
  client: SupabaseClient
  storeId: string
}): Promise<OpenOrderSummary[]> {
  const { data, error } = await client
    .from('order')
    .select(
      'id, order_number, type, status, payment_status, customer_name, table_id, dining_table (id, name), created_at, opened_at'
    )
    .eq('store_id', storeId)
    .in('status', ['OPEN', 'PREPARING', 'DISPATCHED'])

  if (error) throw error

  return (data ?? []).map((order: any) => ({
    ...order,
    table_name: order.dining_table?.name ?? null
  }))
}

export async function ordersQuery({
  client,
  storeId,
  page,
  pageSize,
  search,
  status,
  payment_status
}: {
  client: SupabaseClient
  storeId: string
  page: number
  pageSize: number
  search?: string
  status?: 'OPEN' | 'CLOSED'
  payment_status?: 'PAID' | 'UNPAID'
}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from('order')
    .select(`*, dining_table ( id, name )`, { count: 'exact' })
    .eq('store_id', storeId)

  if (search) query = query.ilike('customer_name', `%${search}%`)
  if (status) query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    orders: (data ?? []).map((order: any) => ({
      ...order,
      table_name: order.dining_table?.name ?? null
    })),
    total: count ?? 0
  }
}

export async function tableOrderQuery({
  client,
  tableId
}: {
  client: SupabaseClient
  tableId: string
}): Promise<{ id: string; order_number: string } | null> {
  const { data, error } = await client
    .from('order')
    .select('id, order_number')
    .eq('table_id', tableId)
    .eq('status', 'OPEN')
    .maybeSingle()

  if (error) throw error
  return data
}
