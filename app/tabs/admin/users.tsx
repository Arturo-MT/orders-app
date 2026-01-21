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
                  trackColor={{ false: '#ccc', true: '#f1aa1c' }}
                  thumbColor={item.is_active ? '#130918' : '#f4f3f4'}
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
        <Ionicons name='add' size={32} color='#fff' />
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
    backgroundColor: '#ece2d0',
    padding: 16
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666'
  },

  row: {
    backgroundColor: '#fff',
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
    color: '#130918',
    fontWeight: '500'
  },

  role: {
    fontSize: 12,
    color: '#666'
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
    backgroundColor: '#130918',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24
  },

  modal: {
    backgroundColor: '#ece2d0',
    borderRadius: 16,
    padding: 20,
    gap: 16
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#130918'
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff'
  },

  roleSelector: {
    flexDirection: 'row',
    gap: 12
  },

  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    alignItems: 'center'
  },

  roleSelected: {
    backgroundColor: '#f1aa1c'
  },

  roleText: {
    fontWeight: '600',
    color: '#130918'
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8
  },

  cancel: {
    color: '#130918',
    fontSize: 16
  },

  save: {
    color: '#130918',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#f1aa1c',
    padding: 8,
    borderRadius: 6
  },

  error: {
    color: 'red',
    fontSize: 14
  },
  saveDisabled: {
    opacity: 0.6
  },
  rowText: {
    fontSize: 16,
    color: '#130918'
  },
  rowTextDisabled: {
    color: '#999'
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
    backgroundColor: '#f1aa1c'
  },
  actionsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 12
  }
})
