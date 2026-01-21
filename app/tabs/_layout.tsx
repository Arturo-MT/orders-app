import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/app/context/AuthContext'
import { useUserQuery } from '@/hooks/api/users'

export default function TabLayout() {
  const { isSuperAdmin } = useAuth()
  const { data } = useUserQuery()
  const role = data?.[0]?.role

  const canSeeAdmin = isSuperAdmin || role === 'admin'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#130918',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#ece2d0',
          borderTopColor: '#eee'
        },
        headerStyle: {
          backgroundColor: '#f1aa1c'
        },
        headerTintColor: '#130918'
      }}
    >
      <Tabs.Screen
        name='pos'
        options={{
          title: 'Nueva Orden',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='receipt-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='dashboard'
        options={{
          title: 'Ordenes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='list-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='summary'
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='bar-chart-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='admin'
        options={{
          title: 'Administrar',
          href: canSeeAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='construct-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='settings-outline' size={size} color={color} />
          )
        }}
      />
    </Tabs>
  )
}
