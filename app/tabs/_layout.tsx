import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
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
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='bar-chart-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='summary'
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='list-outline' size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='admin'
        options={{
          title: 'Administrar',
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
