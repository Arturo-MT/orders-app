import React, { createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { FetchContextType } from '@/types/types'

const FetchContext = createContext<FetchContextType>({
  client: supabase
})

export const FetchProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FetchContext.Provider value={{ client: supabase }}>
      {children}
    </FetchContext.Provider>
  )
}

export const useFetch = () => useContext(FetchContext)
