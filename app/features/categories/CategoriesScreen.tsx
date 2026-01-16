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
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory
} from '@/hooks/api/categories'
import Skeleton from '@/app/components/Skeleton'
import { useFocusEffect } from 'expo-router'

export default function CategoriesScreen() {
  const { data, isLoading, isRefetching, refetch } = useCategoriesQuery({
    showAll: true
  })
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
    is_active: boolean
  } | null>(null)
  const [editName, setEditName] = useState('')

  const saveDisabled = !name.trim() || isCreating
  const editDisabled = !editName.trim() || isUpdating

  const handleCreate = () => {
    if (saveDisabled) return

    createCategory(name.trim(), {
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
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text
                  style={[
                    styles.rowText,
                    !item.is_active && styles.rowTextDisabled
                  ]}
                >
                  {item.name}
                </Text>
              </View>

              <View style={styles.rowActions}>
                <Switch
                  value={item.is_active}
                  onValueChange={(value) =>
                    updateCategory({
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
                    setEditingCategory(item)
                    setEditName(item.name)
                    setEditOpen(true)
                  }}
                >
                  <Ionicons name='pencil-outline' size={20} color='#130918' />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay categorías</Text>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name='add' size={32} color='#fff' />
      </Pressable>

      <Modal visible={open} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nueva categoría</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder='Nombre'
              style={styles.input}
            />

            <View style={styles.actions}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable onPress={handleCreate} disabled={saveDisabled}>
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

      <Modal visible={editOpen} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar categoría</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />

            <View style={styles.actions}>
              <Pressable onPress={() => setEditOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={editDisabled}
                onPress={() => {
                  if (!editingCategory) return

                  updateCategory({
                    id: editingCategory.id,
                    name: editName.trim()
                  })

                  setEditOpen(false)
                  setEditingCategory(null)
                  setEditName('')
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
    justifyContent: 'center'
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16
  },
  cancel: {
    color: '#130918',
    fontSize: 16,
    backgroundColor: '#ccc',
    padding: 8,
    borderRadius: 6
  },
  save: {
    color: '#130918',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#f1aa1c',
    padding: 8,
    borderRadius: 6
  },
  saveDisabled: {
    backgroundColor: '#e0c46c',
    opacity: 0.6
  },
  row: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLeft: {
    flex: 1
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1aa1c'
  }
})
