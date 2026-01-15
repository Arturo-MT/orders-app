import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

export type Store = {
  id: string
  name: string
}

type StoreContextType = {
  store: Store | null
  loading: boolean
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  loading: true
})

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setStore(null)
      setLoading(false)
      return
    }

    const loadStore = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('store_member')
        .select('store(id, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        console.error('[StoreContext]', error)
        setStore(null)
      } else if (data && data.length > 0) {
        data[0].store as Store[]

        setStore(data[0].store as unknown as Store)
      } else {
        setStore(null)
      }

      setLoading(false)
    }

    loadStore()
  }, [user])

  return (
    <StoreContext.Provider value={{ store, loading }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
