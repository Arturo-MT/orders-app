import { useFetch } from '@/app/context/FetchContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ORDERS_KEY } from './constants'
import { OrderDraft } from '@/types/types'
import { useStore } from '@/app/context/StoreContext'
import { orderCreate } from './mutations'

export function useCreateOrder(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()

  return useMutation({
    mutationFn: (payload: OrderDraft) =>
      orderCreate({
        client,
        payload,
        storeId: store!.id
      }),
    ...config
  })
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] })
  }
}
