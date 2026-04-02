import { Slot } from 'expo-router'
import { AuthProvider } from './context/AuthContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { FetchProvider } from './context/FetchContext'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <FetchProvider>
              <ToastProvider>
                <Slot />
              </ToastProvider>
            </FetchProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
