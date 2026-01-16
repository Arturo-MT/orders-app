import { Stack } from 'expo-router'

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ece2d0' },
        headerTintColor: '#130918'
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
    </Stack>
  )
}
