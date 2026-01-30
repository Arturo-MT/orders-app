import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PRODUCTS_KEY } from './constants'
import { productsQuery } from './queries'
import { createProduct, updateProduct } from './mutations'
import { ProductInput, ProductUpdateInput } from '@/types/types'

export function useProductsQuery(config = {}) {
  const { client } = useFetch()
  const { activeStore, loading } = useStore()

  return useQuery({
    queryKey: [PRODUCTS_KEY, activeStore?.id],
    enabled: !!activeStore?.id && !loading,
    queryFn: () =>
      productsQuery({
        client,
        storeId: activeStore!.id,
        showAll: (config as any).showAll || false
      }),
    ...config
  })
}

export function useCreateProduct(config = {}) {
  const { client } = useFetch()
  const { activeStore } = useStore()

  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      if (!activeStore?.id) throw new Error('Store not found')
      return createProduct({
        client,
        storeId: activeStore.id,
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
  const { activeStore, loading } = useStore()
  return () => {
    if (!loading && activeStore?.id) {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_KEY, activeStore.id]
      })
    }
  }
}
