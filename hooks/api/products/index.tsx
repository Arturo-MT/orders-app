import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PRODUCTS_KEY } from './constants'
import { productsQuery } from './queries'
import { createProduct, updateProduct } from './mutations'
import { ProductInput, ProductUpdateInput } from '@/types/types'

export function useProductsQuery(config = {}) {
  const { client } = useFetch()
  const { store, loading } = useStore()

  return useQuery({
    queryKey: [PRODUCTS_KEY, store?.id],
    enabled: !!store?.id && !loading,
    queryFn: () =>
      productsQuery({
        client,
        storeId: store!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateProduct(config = {}) {
  const { client } = useFetch()
  const { store } = useStore()

  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      if (!store?.id) throw new Error('Store not found')
      return createProduct({
        client,
        storeId: store.id,
        payload
      })
    },
    ...config
  })
}

export function useUpdateProduct(config = {}) {
  const { client } = useFetch()

  return useMutation({
    mutationFn: async ({ id, data }: ProductUpdateInput) => {
      return updateProduct({
        client,
        id,
        payload: data
      })
    },
    ...config
  })
}

export function useInvalidateProducts() {
  const { useQueryClient } = require('@tanstack/react-query')
  const queryClient = useQueryClient()
  const { store, loading } = useStore()
  return () => {
    if (!loading && store?.id) {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, store.id] })
    }
  }
}
