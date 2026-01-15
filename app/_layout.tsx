import { Slot } from 'expo-router'
import { AuthProvider } from './context/AuthContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { FetchProvider } from './context/FetchContext'
import { StoreProvider } from './context/StoreContext'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <FetchProvider>
            <Slot />
          </FetchProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
