import { useFetch } from '@/app/context/FetchContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ORDERS_KEY } from './constants'
import { OrderDraft } from '@/types/types'
import { useStore } from '@/app/context/StoreContext'
import { findOpenOrderByTable, orderCreate } from './mutations'
import { clearOrderState } from '@/app/features/orders-list/orderStates'

export function useCreateOrder(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OrderDraft) =>
      orderCreate({
        client,
        payload,
        storeId: activeStore!.id
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      if (data?.order_id) {
        queryClient.invalidateQueries({
          queryKey: ['order', data.order_id]
        })
      }
    }
  })
}

export function useOrderQuery({
  order_id,
  enabled = true
}: {
  order_id: string
  enabled?: boolean
}) {
  const { client } = useFetch()

  return useQuery({
    queryKey: ['order', order_id],
    enabled: !!order_id && enabled,

    queryFn: async () => {
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
          dining_table (
            name
          ),
          order_item (
            id,
            product_id,
            quantity,
            base_price,
            total_price,
            notes,
            product:product_id (
              name
            )
          )
        `
        )
        .eq('id', order_id)
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
  })
}

export function useOpenOrderIds() {
  const { client } = useFetch()
  const { activeStore } = useStore()

  return useQuery({
    queryKey: ['openOrderIds', activeStore?.id],

    queryFn: async () => {
      const { data, error } = await client
        .from('order')
        .select(
          'id, order_number, type, status, payment_status, customer_name, table_id, dining_table (id, name), created_at, opened_at'
        )
        .eq('store_id', activeStore!.id)
        .in('status', ['OPEN', 'PREPARING', 'DISPATCHED'])

      if (error) throw error

      return (data ?? []).map((order: any) => ({
        ...order,
        table_name: order.dining_table?.name ?? null
      }))
    }
  })
}

export function useOrdersQuery({
  page,
  pageSize = 5,
  search,
  status,
  payment_status
}: {
  page: number
  pageSize?: number
  search?: string
  status?: 'OPEN' | 'CLOSED'
  payment_status?: 'PAID' | 'UNPAID'
}) {
  const { client } = useFetch()
  const { activeStore } = useStore()

  return useQuery({
    queryKey: [ORDERS_KEY, page, pageSize, search, status, payment_status, activeStore?.id],

    queryFn: async () => {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = client
        .from('order')
        .select(
          `
    *,
    dining_table (
      id,
      name
    )
    `,
          { count: 'exact' }
        )
        .eq('store_id', activeStore!.id)

      if (search) {
        query = query.ilike('customer_name', `%${search}%`)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (payment_status) {
        query = query.eq('payment_status', payment_status)
      }

      query = query.order('created_at', { ascending: false })

      query = query.range(from, to)

      const { data, count, error } = await query
      if (error) throw error

      return {
        orders: (data ?? []).map((order: any) => ({
          ...order,
          table_name: order.dining_table?.name ?? null
        })),
        total: count ?? 0
      }
    },

    placeholderData: (prev) => prev
  })
}

export function useCloseOrderMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      order_id,
      table_id
    }: {
      order_id: string
      table_id?: string | null
    }) => {
      const { data, error } = await client
        .from('order')
        .update({
          status: 'CLOSED',
          payment_status: 'PAID',
          closed_at: new Date().toISOString()
        })
        .eq('id', order_id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('No se cerró ninguna orden (0 rows affected)')
      }

      if (table_id) {
        const { error: tableError } = await client
          .from('dining_table')
          .update({ is_occupied: false })
          .eq('id', table_id)

        if (tableError) throw tableError
      }
    },

    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: ['order', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['openOrderIds'] })
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      clearOrderState(variables.order_id)
    }
  })
}

export function useChangeTableMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      order_id,
      old_table_id,
      new_table_id
    }: {
      order_id: string
      old_table_id: string | null
      new_table_id: string
    }) => {
      const { error } = await client
        .from('order')
        .update({ table_id: new_table_id })
        .eq('id', order_id)

      if (error) throw error

      if (old_table_id) {
        const { error: oldTableError } = await client
          .from('dining_table')
          .update({ is_occupied: false })
          .eq('id', old_table_id)

        if (oldTableError) throw oldTableError
      }

      const { error: newTableError } = await client
        .from('dining_table')
        .update({ is_occupied: true })
        .eq('id', new_table_id)

      if (newTableError) throw newTableError
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['openOrderIds'] })
      queryClient.invalidateQueries({ queryKey: ['table_order'] })
    }
  })
}

export function useReopenOrderMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      order_id,
      table_id,
      prepared_at,
      dispatched_at
    }: {
      order_id: string
      table_id?: string | null
      prepared_at?: string | null
      dispatched_at?: string | null
    }) => {
      const status = dispatched_at ? 'DISPATCHED' : prepared_at ? 'PREPARING' : 'OPEN'

      const { error } = await client
        .from('order')
        .update({
          status,
          payment_status: 'PENDING',
          closed_at: null
        })
        .eq('id', order_id)

      if (error) throw error

      if (table_id) {
        const { error: tableError } = await client
          .from('dining_table')
          .update({ is_occupied: true })
          .eq('id', table_id)

        if (tableError) throw tableError
      }
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['openOrderIds'] })
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
    }
  })
}

export function useGetTableOrder(table_id: string) {
  const { client } = useFetch()

  return useQuery({
    queryKey: ['table_order', table_id],
    enabled: !!table_id,

    queryFn: async () => findOpenOrderByTable(client, table_id)
  })
}
