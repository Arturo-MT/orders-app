import { Slot } from 'expo-router'
import { AuthProvider } from './context/AuthContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { FetchProvider } from './context/FetchContext'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FetchProvider>
          <Slot />
        </FetchProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
