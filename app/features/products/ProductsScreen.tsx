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
import Skeleton from '@/app/components/Skeleton'
import { useFocusEffect } from 'expo-router'
import {
  useCreateProduct,
  useInvalidateProducts,
  useProductsQuery,
  useUpdateProduct
} from '@/hooks/api/products'
import { useCategoriesQuery } from '@/hooks/api/categories'
import { Picker } from '@react-native-picker/picker'

export default function ProductsScreen() {
  const { data, isLoading, isRefetching, refetch } = useProductsQuery({
    showAll: true
  })
  const { data: categoriesData } = useCategoriesQuery()
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()

  const invalidate = useInvalidateProducts()

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [editingProduct, setEditingProduct] = useState<{
    id: string
    name: string
  } | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState(0)

  const saveDisabled =
    !name.trim() || !selectedCategory || price <= 0 || isCreating

  const editDisabled = !editName.trim() || isUpdating

  const handleCreate = () => {
    if (saveDisabled || !selectedCategory) return

    createProduct(
      {
        name: name.trim(),
        price,
        category_id: selectedCategory
      },
      {
        onSuccess: () => {
          setName('')
          setPrice(0)
          setSelectedCategory(null)
          setOpen(false)
          invalidate()
        }
      }
    )
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
                    updateProduct(
                      {
                        id: item.id,
                        data: { is_active: value }
                      },
                      {
                        onSuccess: () => invalidate()
                      }
                    )
                  }
                  trackColor={{ false: '#ccc', true: '#f1aa1c' }}
                  thumbColor={item.is_active ? '#130918' : '#f4f3f4'}
                />

                <Pressable
                  style={styles.iconButton}
                  onPress={() => {
                    setEditingProduct(item)
                    setEditName(item.name)
                    setEditCategory(item.category_id)
                    setEditPrice(item.price)
                    setEditOpen(true)
                  }}
                >
                  <Ionicons name='pencil-outline' size={20} color='#130918' />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay productos</Text>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name='add' size={32} color='#fff' />
      </Pressable>

      {/* MODAL CREAR */}
      <Modal visible={open} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo producto</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder='Nombre'
              style={styles.input}
            />

            <TextInput
              value={price === 0 ? '' : String(price)}
              onChangeText={(text) =>
                setPrice(Number(text.replace(',', '.')) || 0)
              }
              placeholder='Precio'
              keyboardType='numeric'
              style={styles.input}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.selectorTitle}>Categoría</Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <Picker.Item label='Selecciona una categoría' value={null} />
                  {categoriesData?.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                  ))}
                </Picker>
              </View>
            </View>

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
            <Text style={styles.modalTitle}>Editar producto</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder='Nombre'
              style={styles.input}
            />

            <View>
              <Text>Precio</Text>
              <TextInput
                value={String(editPrice)}
                onChangeText={(text) =>
                  setEditPrice(Number(text.replace(',', '.')) || 0)
                }
                placeholder='Precio'
                keyboardType='numeric'
                style={styles.input}
              />
            </View>

            <View style={styles.categorySelector}>
              <Text style={styles.selectorTitle}>Categoría</Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editCategory}
                  onValueChange={(value) => setEditCategory(value)}
                >
                  <Picker.Item label='Selecciona una categoría' value={null} />
                  {categoriesData?.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.actionsRight}>
              <Pressable onPress={() => setEditOpen(false)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={editDisabled || !editName.trim() || !editCategory}
                onPress={() => {
                  if (!editingProduct || !editCategory) return

                  updateProduct(
                    {
                      id: editingProduct.id,
                      data: {
                        name: editName.trim(),
                        category_id: editCategory,
                        price: editPrice
                      }
                    },
                    { onSuccess: () => invalidate() }
                  )

                  setEditOpen(false)
                  setEditingProduct(null)
                  setEditName('')
                  setEditCategory(null)
                  setEditPrice(0)
                }}
              >
                <Text
                  style={[
                    styles.save,
                    (editDisabled || !editName.trim() || !editCategory) &&
                      styles.saveDisabled
                  ]}
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
  categorySelector: {
    gap: 8
  },
  selectorTitle: {
    fontWeight: '600',
    color: '#130918'
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ece2d0'
  },
  categoryOptionSelected: {
    backgroundColor: '#f1aa1c'
  },
  categoryText: {
    fontWeight: '600',
    color: '#130918'
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
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff'
  }
})
