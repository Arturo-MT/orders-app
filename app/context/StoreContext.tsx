import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Store = {
  id: string
  name: string
}

type StoreContextType = {
  stores: Store[]
  activeStore: Store | null
  setActiveStore: (store: Store) => void
  loading: boolean
}

const StoreContext = createContext<StoreContextType>({
  stores: [],
  activeStore: null,
  setActiveStore: () => {},
  loading: true
})

const LAST_STORE_KEY = 'last_active_store_id'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [activeStore, _setActiveStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Setter con persistencia
   */
  const setActiveStore = async (store: Store) => {
    _setActiveStore(store)
    try {
      await AsyncStorage.setItem(LAST_STORE_KEY, store.id)
    } catch (err) {
      console.error('[StoreContext] Error saving store', err)
    }
  }

  useEffect(() => {
    if (!user) {
      setStores([])
      _setActiveStore(null)
      setLoading(false)
      return
    }

    const loadStores = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('store_member')
        .select('store(id, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        console.error('[StoreContext]', error)
        setStores([])
        _setActiveStore(null)
        setLoading(false)
        return
      }

      const userStores = data
        ?.map((row) => row.store)
        .filter(Boolean) as unknown as Store[]

      setStores(userStores)

      // 🔑 recuperar último store usado
      let lastStoreId: string | null = null
      try {
        lastStoreId = await AsyncStorage.getItem(LAST_STORE_KEY)
      } catch (err) {
        console.warn('[StoreContext] Error reading last store', err)
      }

      const restored =
        userStores.find((s) => s.id === lastStoreId) ?? userStores[0] ?? null

      _setActiveStore(restored)
      setLoading(false)
    }

    loadStores()
  }, [user])

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        setActiveStore,
        loading
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
