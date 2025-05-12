import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ea',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee'
        },
        headerStyle: {
          backgroundColor: '#6200ea'
        },
        headerTintColor: '#fff'
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
