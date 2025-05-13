import { useFetch } from '@/app/context/FetchContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderQuery, ordersQuery } from './queries'
import { ORDERS_KEY } from './constants'
import { ordersMutation, orderUpdateMutation } from './mutations'
import { Order, OrderUpdate } from '@/types/types'

export function useOrdersQuery(config = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [ORDERS_KEY],
    queryFn: () => ordersQuery({ client }),
    ...config
  })
}

export function useOrderQuery(id: number, config = {}) {
  const { client } = useFetch()
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => orderQuery({ client, id }),
    ...config
  })
}

export function useOrdersMutation(config = {}) {
  const { client } = useFetch()

  return useMutation({
    mutationFn: (payload: Order) => ordersMutation({ client, payload }),
    ...config
  })
}

export function useOrderUpdateMutation(id: number, config = {}) {
  const { client } = useFetch()

  return useMutation({
    mutationFn: ({ payload }: { payload: OrderUpdate }) =>
      orderUpdateMutation({ client, payload, id }),
    ...config
  })
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
  }
}
