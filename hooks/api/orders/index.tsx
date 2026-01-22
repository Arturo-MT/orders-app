import { useFetch } from '@/app/context/FetchContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ORDERS_KEY } from './constants'
import { OrderDraft } from '@/types/types'
import { useStore } from '@/app/context/StoreContext'
import { orderCreate } from './mutations'

export function useCreateOrder(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OrderDraft) =>
      orderCreate({
        client,
        payload,
        storeId: store!.id
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

export function useOrderQuery({ order_id }: { order_id: string }) {
  const { client } = useFetch()

  return useQuery({
    queryKey: ['order', order_id],
    enabled: !!order_id,

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

export function useOrdersQuery({
  page,
  pageSize = 5,
  search,
  status
}: {
  page: number
  pageSize?: number
  search?: string
  status?: 'OPEN' | 'CLOSED'
}) {
  const { client } = useFetch()

  return useQuery({
    queryKey: [ORDERS_KEY, page, pageSize, search, status],

    queryFn: async () => {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = client.from('order').select('*', { count: 'exact' })

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
        orders: data ?? [],
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
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      queryClient.invalidateQueries({
        queryKey: ['order', variables.order_id]
      })
    }
  })
}
