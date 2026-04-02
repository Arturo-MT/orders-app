import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import BluetoothSettings from './BluetoothSettings'
import { useUserQuery } from '@/hooks/api/users'
import { useAuth } from '@/app/context/AuthContext'
import { Pressable } from 'react-native'
import StoreSelector from './StoreSelector'
import { theme } from '@/constants/Colors'

export default function SettingsScreen() {
  const { data, isLoading, error } = useUserQuery()
  const { user, logout, isSuperAdmin } = useAuth()
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

  const role = isSuperAdmin ? 'super admin' : store_member_data?.role

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: 12 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{role ?? '—'}</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tienda</Text>
        <Text style={styles.value}>{store_member_data?.store.name ?? '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar tienda</Text>
        <StoreSelector />
      </View>

      <View style={[styles.section, styles.bluetoothSection]}>
        <BluetoothSettings />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
    gap: 24
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    gap: 6
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.textPrimary
  },
  label: {
    fontSize: 12,
    color: theme.textSecondary
  },
  value: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 8
  },
  logoutButton: {
    backgroundColor: theme.destructive,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  bluetoothSection: {}
})
