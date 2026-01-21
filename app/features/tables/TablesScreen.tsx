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
import { useFocusEffect } from 'expo-router'
import Skeleton from '@/app/components/Skeleton'
import {
  useTablesQuery,
  useCreateTable,
  useUpdateTable
} from '@/hooks/api/tables'

export default function TablesScreen() {
  const { data, isLoading, isRefetching, refetch } = useTablesQuery()
  const { mutate: createTable, isPending: isCreating } = useCreateTable()
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable()

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [name, setName] = useState('')
  const [editingTable, setEditingTable] = useState<{
    id: string
    name: string
    is_active: boolean
  } | null>(null)

  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)

  const saveDisabled = !name.trim() || isCreating
  const editDisabled = !editName.trim() || isUpdating

  const handleCreate = () => {
    if (saveDisabled) return

    createTable(name.trim(), {
      onSuccess: () => {
        setName('')
        setOpen(false)
      }
    })
  }

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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text
                style={[
                  styles.rowText,
                  !item.is_active && styles.rowTextDisabled
                ]}
              >
                {item.name}
              </Text>

              <View style={styles.rowActions}>
                <Switch
                  value={item.is_active}
                  onValueChange={(value) =>
                    updateTable({
                      id: item.id,
                      is_active: value
                    })
                  }
                  trackColor={{ false: '#ccc', true: '#f1aa1c' }}
                  thumbColor={item.is_active ? '#130918' : '#f4f3f4'}
                />

                <Pressable
                  style={styles.iconButton}
                  onPress={() => {
                    setEditingTable(item)
                    setEditName(item.name)
                    setEditActive(item.is_active)
                    setEditOpen(true)
                  }}
                >
                  <Ionicons name='pencil-outline' size={20} color='#130918' />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No hay mesas</Text>}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name='add' size={32} color='#fff' />
      </Pressable>

      {/* MODAL CREAR */}
      <Modal visible={open} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nueva mesa</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder='Nombre de la mesa'
              style={styles.input}
            />

            <View style={styles.actionsRight}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable disabled={saveDisabled} onPress={handleCreate}>
                <Text
                  style={[styles.save, saveDisabled && styles.saveDisabled]}
                >
                  {isCreating ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR */}
      <Modal visible={editOpen} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar mesa</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder='Nombre'
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text>Activa</Text>
              <Switch value={editActive} onValueChange={setEditActive} />
            </View>

            <View style={styles.actionsRight}>
              <Pressable onPress={() => setEditOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={editDisabled}
                onPress={() => {
                  if (!editingTable) return

                  updateTable({
                    id: editingTable.id,
                    name: editName.trim(),
                    is_active: editActive
                  })

                  setEditOpen(false)
                  setEditingTable(null)
                }}
              >
                <Text
                  style={[styles.save, editDisabled && styles.saveDisabled]}
                >
                  {isUpdating ? 'Guardando...' : 'Guardar'}
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
    elevation: 4
  },

  row: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  rowText: {
    fontSize: 16,
    fontWeight: '500',
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

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1aa1c'
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

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },

  actionsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 12
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },

  saveDisabled: {
    opacity: 0.6
  }
})
