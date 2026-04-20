import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { clearOrderState } from '@/app/features/orders-list/orderStates'
import { OrderDraft } from '@/types/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  OPEN_ORDERS_KEY,
  ORDER_KEY,
  ORDERS_KEY,
  TABLE_ORDER_KEY
} from './constants'
import {
  changeOrderTable,
  closeOrder,
  orderCreate,
  reopenOrder
} from './mutations'
import {
  openOrderIdsQuery,
  orderQuery,
  ordersQuery,
  tableOrderQuery
} from './queries'
import { useRealtimeInvalidate } from './useRealtimeInvalidate'

export function useCreateOrder(config: { retry?: number; retryDelay?: number } = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OrderDraft) =>
      orderCreate({ client, payload, storeId: activeStore!.id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      if (data?.order_id) {
        queryClient.invalidateQueries({ queryKey: [ORDER_KEY, data.order_id] })
      }
    },
    ...config
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
  const isEnabled = !!order_id && enabled

  useRealtimeInvalidate({
    table: 'order',
    filter: order_id ? `id=eq.${order_id}` : undefined,
    queryKey: [ORDER_KEY, order_id],
    enabled: isEnabled
  })

  useRealtimeInvalidate({
    table: 'order_item',
    filter: order_id ? `order_id=eq.${order_id}` : undefined,
    queryKey: [ORDER_KEY, order_id],
    enabled: isEnabled
  })

  return useQuery({
    queryKey: [ORDER_KEY, order_id],
    enabled: isEnabled,
    queryFn: () => orderQuery({ client, orderId: order_id })
  })
}

export function useOpenOrderIds() {
  const { client } = useFetch()
  const { activeStore } = useStore()

  useRealtimeInvalidate({
    table: 'order',
    filter: activeStore?.id ? `store_id=eq.${activeStore.id}` : undefined,
    queryKey: [OPEN_ORDERS_KEY, activeStore?.id],
    enabled: !!activeStore?.id
  })

  return useQuery({
    queryKey: [OPEN_ORDERS_KEY, activeStore?.id],
    queryFn: () => openOrderIdsQuery({ client, storeId: activeStore!.id })
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
    queryKey: [
      ORDERS_KEY,
      page,
      pageSize,
      search,
      status,
      payment_status,
      activeStore?.id
    ],
    queryFn: () =>
      ordersQuery({
        client,
        storeId: activeStore!.id,
        page,
        pageSize,
        search,
        status,
        payment_status
      }),
    placeholderData: (prev) => prev
  })
}

export function useCloseOrderMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      order_id,
      table_id
    }: {
      order_id: string
      table_id?: string | null
    }) => closeOrder({ client, orderId: order_id, tableId: table_id }),

    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: [ORDER_KEY, variables.order_id] })
      queryClient.invalidateQueries({ queryKey: [OPEN_ORDERS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
      clearOrderState(variables.order_id)
    }
  })
}

export function useChangeTableMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      order_id,
      old_table_id,
      new_table_id
    }: {
      order_id: string
      old_table_id: string | null
      new_table_id: string
    }) =>
      changeOrderTable({
        client,
        orderId: order_id,
        oldTableId: old_table_id,
        newTableId: new_table_id
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDER_KEY, variables.order_id] })
      queryClient.invalidateQueries({ queryKey: [OPEN_ORDERS_KEY] })
      queryClient.invalidateQueries({ queryKey: [TABLE_ORDER_KEY] })
    }
  })
}

export function useReopenOrderMutation() {
  const { client } = useFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      order_id,
      table_id,
      prepared_at,
      dispatched_at
    }: {
      order_id: string
      table_id?: string | null
      prepared_at?: string | null
      dispatched_at?: string | null
    }) =>
      reopenOrder({
        client,
        orderId: order_id,
        tableId: table_id,
        preparedAt: prepared_at,
        dispatchedAt: dispatched_at
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDER_KEY, variables.order_id] })
      queryClient.invalidateQueries({ queryKey: [OPEN_ORDERS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
    }
  })
}

export function useGetTableOrder(table_id: string) {
  const { client } = useFetch()

  return useQuery({
    queryKey: [TABLE_ORDER_KEY, table_id],
    enabled: !!table_id,
    queryFn: () => tableOrderQuery({ client, tableId: table_id })
  })
}
