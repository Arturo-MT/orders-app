import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import BluetoothSettings from './BluetoothSettings'
import { useUserQuery } from '@/hooks/api/users'
import { useAuth } from '@/app/context/AuthContext'
import StoreSelector from './StoreSelector'
import { theme } from '@/constants/Colors'
import { useStore } from '@/app/context/StoreContext'

export default function SettingsScreen() {
  const { data, isLoading, error } = useUserQuery()
  const { user, logout, isSuperAdmin } = useAuth()
  const { stores } = useStore()
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
      <View style={styles.centered}>
        <Text style={styles.mutedText}>Cargando información...</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.mutedText}>Error al cargar datos del usuario</Text>
      </View>
    )
  }

  const store_member_data = data[0]
  const role = isSuperAdmin ? 'super admin' : store_member_data?.role

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{role ?? '—'}</Text>
        </View>
        <Pressable
          style={[styles.logoutButton, loadingLogout && styles.logoutDisabled]}
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
        <Text style={styles.value}>
          {store_member_data?.store.name ?? '—'}
        </Text>
        {stores.length > 1 && <StoreSelector />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bluetooth</Text>
        <BluetoothSettings />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  content: {
    padding: 20,
    gap: 12
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background
  },
  mutedText: {
    color: theme.textSecondary,
    fontSize: 14
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: theme.borderLight
  },
  label: {
    fontSize: 13,
    color: theme.textSecondary
  },
  value: {
    fontSize: 14,
    color: theme.textPrimary
  },
  logoutButton: {
    marginTop: 4,
    backgroundColor: theme.destructive,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutDisabled: {
    opacity: 0.6
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  }
})
