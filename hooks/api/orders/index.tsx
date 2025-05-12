import { useFetch } from '@/app/context/FetchContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orderQuery, ordersQuery } from './queries'
import { ORDERS_KEY } from './constants'
import { ordersMutation } from './mutations'
import { Order } from '@/types/types'

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
