import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import BluetoothSettings from './BluetoothSettings'
import { useUserQuery } from '@/hooks/api/users'
import { useAuth } from '@/app/context/AuthContext'
import { Pressable } from 'react-native'

export default function SettingsScreen() {
  const { data, isLoading, error } = useUserQuery()
  const { user, logout } = useAuth()
  const [loadingLogout, setLoadingLogout] = React.useState(false)

  const handleLogout = async () => {
    setLoadingLogout(true)
    try {
      await logout()
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      setLoadingLogout(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando información...</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Text>Error al cargar datos del usuario</Text>
      </View>
    )
  }

  const store_member_data = data[0]

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tienda</Text>
        <Text style={styles.value}>{store_member_data?.store.name ?? '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{store_member_data?.role ?? '—'}</Text>
      </View>

      <View style={[styles.section, styles.bluetoothSection]}>
        <BluetoothSettings />
      </View>

      <View style={styles.section}>
        <Pressable
          style={
            loadingLogout
              ? [styles.logoutButton, { opacity: 0.6 }]
              : styles.logoutButton
          }
          onPress={handleLogout}
          disabled={loadingLogout}
        >
          <Text style={styles.logoutText}>
            {loadingLogout ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece2d0',
    padding: 20,
    gap: 24
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 6
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937'
  },
  label: {
    fontSize: 12,
    color: '#6b7280'
  },
  value: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8
  },
  logoutButton: {
    backgroundColor: '#F56A57',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#130918',
    fontSize: 16,
    fontWeight: '600'
  },
  bluetoothSection: {
    maxHeight: 300
  }
})
