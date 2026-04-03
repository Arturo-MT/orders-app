import { Stack } from 'expo-router'
import { useTheme } from '@/app/context/ThemeContext'

export default function AdminLayout() {
  const { theme } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.textPrimary
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Administración',
          headerShown: false
        }}
      />
      <Stack.Screen name='categories' options={{ title: 'Categorías' }} />
      <Stack.Screen name='products' options={{ title: 'Productos' }} />
      <Stack.Screen name='tables' options={{ title: 'Mesas' }} />
      <Stack.Screen name='users' options={{ title: 'Usuarios' }} />
    </Stack>
  )
}
