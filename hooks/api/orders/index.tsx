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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      if (data?.order_id) {
        queryClient.invalidateQueries({
          queryKey: ['order', data.order_id]
        })
      }
    }
  })
}

export function useOrderQuery({ order_id, enabled = true }: { order_id: string; enabled?: boolean }) {
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
          customer_name,
          table_id,
          created_at,
          closed_at,
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
        customer_name: data.customer_name,
        table_name: data.dining_table?.name ?? null,
        created_at: data.created_at,
        closed_at: data.closed_at,
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
        .select('id, order_number, type, status, customer_name, table_id, dining_table (id, name), created_at')
        .eq('store_id', activeStore!.id)
        .in('status', ['OPEN', 'UNPAID'])

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
  status
}: {
  page: number
  pageSize?: number
  search?: string
  status?: 'OPEN' | 'CLOSED' | 'UNPAID'
}) {
  const { client } = useFetch()
  const { activeStore } = useStore()

  return useQuery({
    queryKey: [ORDERS_KEY, page, pageSize, search, status, activeStore?.id],

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

export function useGetTableOrder(table_id: string) {
  const { client } = useFetch()

  return useQuery({
    queryKey: ['table_order', table_id],
    enabled: !!table_id,

    queryFn: async () => findOpenOrderByTable(client, table_id)
  })
}
