import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  Switch
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  useStoreMembersQuery,
  useCreateStoreMember,
  useUpdateStoreMember
} from '@/hooks/api/store-members'
import Skeleton from '@/app/components/Skeleton'
import { useFocusEffect } from 'expo-router'
import { useAuth } from '@/app/context/AuthContext'
import { theme } from '@/constants/Colors'

interface UsersScreenProps {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  is_active: boolean
}

export default function UsersScreen() {
  const { user } = useAuth()
  const { data, isLoading, isRefetching, refetch } = useStoreMembersQuery()

  const { mutate: createMember, isPending: isCreating } = useCreateStoreMember()

  const { mutate: updateMember } = useUpdateStoreMember()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')

  const saveDisabled = !email.trim() || isCreating

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  return (
    <View style={styles.container}>
      {(isLoading || isRefetching) && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width='100%' height={56} radius={12} />
          ))}
        </View>
      )}

      {!isLoading && !isRefetching && (
        <FlatList
          data={data}
          keyExtractor={(item: UsersScreenProps) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text
                  style={[
                    styles.rowText,
                    !item.is_active && styles.rowTextDisabled
                  ]}
                >
                  {item.email}
                  {user?.email === item.email ? ' (Tú)' : ''}
                </Text>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>

              <View style={styles.rowActions}>
                <Switch
                  value={item.is_active}
                  disabled={item.email === user?.email}
                  onValueChange={(value) =>
                    updateMember({
                      id: item.id,
                      is_active: value
                    })
                  }
                  style={{
                    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                    opacity: item.email === user?.email ? 0.6 : 1
                  }}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={item.is_active ? theme.textPrimary : theme.borderLight}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay usuarios asignados</Text>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name='add' size={32} color={theme.surface} />
      </Pressable>

      <Modal visible={open} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Agregar usuario</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder='Email'
              autoCapitalize='none'
              keyboardType='email-address'
              style={styles.input}
            />

            <View style={styles.roleSelector}>
              <Pressable
                onPress={() => setRole('staff')}
                style={[
                  styles.roleOption,
                  role === 'staff' && styles.roleSelected
                ]}
              >
                <Text style={styles.roleText}>Staff</Text>
              </Pressable>

              <Pressable
                onPress={() => setRole('admin')}
                style={[
                  styles.roleOption,
                  role === 'admin' && styles.roleSelected
                ]}
              >
                <Text style={styles.roleText}>Admin</Text>
              </Pressable>
            </View>

            <View style={styles.actionsRight}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={saveDisabled}
                onPress={() => {
                  createMember(
                    { email, role },
                    {
                      onSuccess: () => {
                        setEmail('')
                        setRole('staff')
                        setOpen(false)
                      }
                    }
                  )
                }}
              >
                <Text
                  style={[styles.save, saveDisabled && styles.saveDisabled]}
                >
                  {isCreating ? 'Agregando...' : 'Agregar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: theme.textSecondary
  },

  row: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  info: {
    flex: 1,
    gap: 4
  },

  email: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: '500'
  },

  role: {
    fontSize: 12,
    color: theme.textSecondary
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.textPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'center',
    padding: 24
  },

  modal: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 20,
    gap: 16
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary
  },

  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.surface
  },

  roleSelector: {
    flexDirection: 'row',
    gap: 12
  },

  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.borderLight,
    alignItems: 'center'
  },

  roleSelected: {
    backgroundColor: theme.primary
  },

  roleText: {
    fontWeight: '600',
    color: theme.textPrimary
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8
  },

  cancel: {
    color: theme.textPrimary,
    fontSize: 16
  },

  save: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: theme.primary,
    padding: 8,
    borderRadius: 6
  },

  error: {
    color: theme.destructive,
    fontSize: 14
  },
  saveDisabled: {
    opacity: 0.6
  },
  rowText: {
    fontSize: 16,
    color: theme.textPrimary
  },
  rowTextDisabled: {
    color: theme.textMuted
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowLeft: {
    flex: 1
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary
  },
  actionsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 12
  }
})
