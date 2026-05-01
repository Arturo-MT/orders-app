import { useCallback, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Skeleton from '@/components/Skeleton'
import { useFocusEffect } from 'expo-router'
import {
  useCreateProduct,
  useProductsQuery,
  useUpdateProduct,
} from '@/hooks/api/products'
import { useCategoriesQuery } from '@/hooks/api/categories'
import { Picker } from '@react-native-picker/picker'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { AppBottomSheet, AppBottomSheetRef, BottomSheetTextInput, SHEET_SNAP } from '@/components/ui/BottomSheet'
import { useFabBottomInset } from '@/hooks/useOrientation'

export default function ProductsScreen() {
  const { data, isLoading, isRefetching, refetch } = useProductsQuery({ showAll: true })
  const { data: categoriesData } = useCategoriesQuery()
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
  const { theme } = useTheme()
  const styles = makeStyles(theme)
  const fabBottom = useFabBottomInset()

  const createSheetRef = useRef<AppBottomSheetRef>(null)
  const editSheetRef = useRef<AppBottomSheetRef>(null)
  const createInputRef = useRef<{ focus: () => void } | null>(null)
  const editInputRef = useRef<{ focus: () => void } | null>(null)

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState(0)

  const saveDisabled = !name.trim() || !selectedCategory || price <= 0 || isCreating
  const editDisabled = !editName.trim() || !editCategory || editPrice <= 0 || isUpdating

  const groupedData = useMemo(() => {
    if (!data || !categoriesData) return []
    const map = new Map<string, { id: string; name: string; products: typeof data }>()
    categoriesData.forEach((cat) => { map.set(cat.id, { id: cat.id, name: cat.name, products: [] }) })
    data.forEach((product) => {
      if (product.category_id) {
        const group = map.get(product.category_id)
        if (group) group.products.push(product)
      }
    })
    map.forEach((group) => {
      group.products.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
  }, [data, categoriesData])

  useFocusEffect(
    useCallback(() => {
      if (categoriesData) setOpenCategories({})
      refetch()
    }, [refetch])
  )

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCreate = () => {
    if (saveDisabled || !selectedCategory) return
    createProduct(
      { name: name.trim(), price, category_id: selectedCategory },
      { onSuccess: () => { setName(''); setPrice(0); setSelectedCategory(null); createSheetRef.current?.close() } }
    )
  }

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
          data={groupedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
          renderItem={({ item }) => {
            const isOpen = openCategories[item.id]
            return (
              <View>
                <Pressable onPress={() => toggleCategory(item.id)} style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{item.name} ({item.products.length})</Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textOnPrimary} />
                </Pressable>

                {isOpen && item.products.map((product) => (
                  <View key={product.id} style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text style={[styles.rowText, !product.is_active && styles.rowTextDisabled]}>
                        {product.name}
                      </Text>
                      <Text style={[styles.rowText, !product.is_active && styles.rowTextDisabled]}>
                        $ {product.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <Switch
                        value={product.is_active}
                        onValueChange={(value) => updateProduct({ id: product.id, data: { is_active: value } })}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={product.is_active ? theme.textPrimary : theme.borderLight}
                      />
                      <Pressable
                        style={styles.iconButton}
                        onPress={() => {
                          setEditingProduct(product)
                          setEditName(product.name)
                          setEditCategory(product.category_id)
                          setEditPrice(product.price)
                          editSheetRef.current?.open()
                        }}
                      >
                        <Ionicons name='pencil-outline' size={20} color={theme.textOnPrimary} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )
          }}
          ListEmptyComponent={<Text style={styles.empty}>No hay productos</Text>}
        />
      )}

      <Pressable style={[styles.fab, { bottom: fabBottom }]} onPress={() => createSheetRef.current?.open()}>
        <Ionicons name='add' size={32} color={theme.surface} />
      </Pressable>

      {/* Create product sheet */}
      <AppBottomSheet ref={createSheetRef} snapPoints={SHEET_SNAP.form} scrollable onOpen={() => createInputRef.current?.focus()}>
        <Text style={styles.sheetTitle}>Nuevo producto</Text>
        <BottomSheetTextInput
          ref={createInputRef}
          value={name}
          onChangeText={setName}
          placeholder='Nombre'
          placeholderTextColor={theme.textMuted}
          style={styles.input}
        />
        <BottomSheetTextInput
          value={price === 0 ? '' : String(price)}
          onChangeText={(text) => setPrice(Number(text.replace(',', '.')) || 0)}
          placeholder='Precio'
          placeholderTextColor={theme.textMuted}
          keyboardType='numeric'
          style={styles.input}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={{ color: theme.textPrimary }}
            dropdownIconColor={theme.textSecondary}
          >
            <Picker.Item label='Selecciona una categoría' value={null} color={theme.textPrimary} style={{ backgroundColor: theme.surface }} />
            {categoriesData?.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} color={theme.textPrimary} style={{ backgroundColor: theme.surface }} />
            ))}
          </Picker>
        </View>
        <View style={styles.actionsRight}>
          <Pressable onPress={() => createSheetRef.current?.close()}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
          <Pressable disabled={saveDisabled} onPress={handleCreate}>
            <Text style={[styles.save, saveDisabled && styles.saveDisabled]}>
              {isCreating ? 'Guardando...' : 'Guardar'}
            </Text>
          </Pressable>
        </View>
      </AppBottomSheet>

      {/* Edit product sheet */}
      <AppBottomSheet
        ref={editSheetRef}
        snapPoints={SHEET_SNAP.form}
        scrollable
        onDismiss={() => { setEditingProduct(null); setEditName(''); setEditCategory(null); setEditPrice(0) }}
        onOpen={() => editInputRef.current?.focus()}
      >
        <Text style={styles.sheetTitle}>Editar producto</Text>
        <BottomSheetTextInput
          ref={editInputRef}
          value={editName}
          onChangeText={setEditName}
          placeholder='Nombre'
          placeholderTextColor={theme.textMuted}
          style={styles.input}
        />
        <BottomSheetTextInput
          value={editPrice === 0 ? '' : String(editPrice)}
          onChangeText={(text) => setEditPrice(Number(text.replace(',', '.')) || 0)}
          placeholder='Precio'
          placeholderTextColor={theme.textMuted}
          keyboardType='numeric'
          style={styles.input}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={editCategory}
            onValueChange={(value) => setEditCategory(value)}
            style={{ color: theme.textPrimary }}
            dropdownIconColor={theme.textSecondary}
          >
            <Picker.Item label='Selecciona una categoría' value={null} color={theme.textPrimary} style={{ backgroundColor: theme.surface }} />
            {categoriesData?.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} color={theme.textPrimary} style={{ backgroundColor: theme.surface }} />
            ))}
          </Picker>
        </View>
        <View style={styles.actionsRight}>
          <Pressable onPress={() => editSheetRef.current?.close()}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={editDisabled}
            onPress={() => {
              updateProduct({ id: editingProduct.id, data: { name: editName.trim(), category_id: editCategory ?? undefined, price: editPrice } })
              editSheetRef.current?.close()
            }}
          >
            <Text style={[styles.save, editDisabled && styles.saveDisabled]}>
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </Text>
          </Pressable>
        </View>
      </AppBottomSheet>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    empty: { textAlign: 'center', marginTop: 40, color: theme.textSecondary },
    fab: {
      position: 'absolute', right: 16, bottom: 16,
      backgroundColor: theme.textPrimary, width: 56, height: 56,
      borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4
    },
    categoryHeader: {
      backgroundColor: theme.primary, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    categoryTitle: { fontSize: 16, fontWeight: '700', color: theme.textOnPrimary },
    row: {
      backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 12,
      borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginTop: 8
    },
    rowLeft: { flex: 1 },
    rowText: { fontSize: 16, color: theme.textPrimary },
    rowTextDisabled: { color: theme.textMuted },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconButton: {
      width: 36, height: 36, borderRadius: 6,
      alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary
    },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 16 },
    input: {
      borderWidth: 1, borderColor: theme.border, borderRadius: 12,
      padding: 12, backgroundColor: theme.background, color: theme.textPrimary,
      marginBottom: 12,
    },
    actionsRight: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 12 },
    cancel: { color: theme.textPrimary, fontSize: 16 },
    save: {
      color: theme.textOnPrimary, fontSize: 16, fontWeight: '600',
      backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8
    },
    saveDisabled: { opacity: 0.6 },
    pickerWrapper: {
      borderWidth: 1, borderColor: theme.border, borderRadius: 12,
      overflow: 'hidden', backgroundColor: theme.background, marginBottom: 12,
    }
  })
