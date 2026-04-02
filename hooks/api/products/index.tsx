import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useCreateProduct() {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      if (!activeStore?.id) throw new Error('Store not found')
      return createProduct({
        client,
        storeId: activeStore.id,
        payload
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [PRODUCTS_KEY, activeStore!.id],
        (old: any) => (old ? [...old, data] : [data])
      )
    }
  })
}

export function useUpdateProduct() {
  const { client } = useFetch()
  const { activeStore } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: ProductUpdateInput) => {
      return updateProduct({
        client,
        id,
        payload: data
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [PRODUCTS_KEY, activeStore?.id],
        (old: any) =>
          old?.map((p: any) => (p.id === data.id ? data : p))
      )
    }
  })
}

export function useInvalidateProducts() {
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

export function useRefetchProducts() {
  const queryClient = useQueryClient()
  const { activeStore, loading } = useStore()
  return () => {
    if (!loading && activeStore?.id) {
      queryClient.refetchQueries({
        queryKey: [PRODUCTS_KEY, activeStore.id]
      })
    }
  }
}
