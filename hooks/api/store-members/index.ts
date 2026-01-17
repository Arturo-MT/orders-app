import { useFetch } from '@/app/context/FetchContext'
import { useStore } from '@/app/context/StoreContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STORE_MEMBERS_KEY } from './constants'
import { createStoreMember, updateStoreMember } from './mutations'
import { storeMembersQuery } from './queries'

export function useStoreMembersQuery() {
  const { client } = useFetch()
  const { store } = useStore()

  return useQuery({
    queryKey: [STORE_MEMBERS_KEY, store?.id],
    enabled: !!store?.id,
    queryFn: () => storeMembersQuery(client, store!.id)
  })
}

export function useCreateStoreMember() {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      email,
      role,
      is_active
    }: {
      email: string
      role?: 'admin' | 'staff'
      is_active?: boolean
    }) =>
      createStoreMember({
        client,
        storeId: store!.id,
        email: email,
        role: role,
        is_active: is_active
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [STORE_MEMBERS_KEY, store?.id]
      })
    }
  })
}

export function useUpdateStoreMember() {
  const { client } = useFetch()
  const { store } = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      id: string
      role?: 'admin' | 'staff'
      is_active?: boolean
    }) =>
      updateStoreMember({
        client,
        storeId: store!.id,
        id: input.id,
        role: input.role,
        is_active: input.is_active
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [STORE_MEMBERS_KEY, store?.id]
      })
    }
  })
}
