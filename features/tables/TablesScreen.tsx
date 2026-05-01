import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import Skeleton from '@/components/Skeleton'
import { useTablesQuery, useCreateTable, useUpdateTable } from '@/hooks/api/tables'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { AppBottomSheet, AppBottomSheetRef, BottomSheetTextInput, SHEET_SNAP } from '@/components/ui/BottomSheet'
import { useFabBottomInset } from '@/hooks/useOrientation'

export default function TablesScreen() {
  const { data, isLoading, isRefetching, refetch } = useTablesQuery()
  const { mutate: createTable, isPending: isCreating } = useCreateTable()
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable()
  const { theme } = useTheme()
  const styles = makeStyles(theme)
  const fabBottom = useFabBottomInset()

  const createSheetRef = useRef<AppBottomSheetRef>(null)
  const editSheetRef = useRef<AppBottomSheetRef>(null)
  const createInputRef = useRef<{ focus: () => void } | null>(null)
  const editInputRef = useRef<{ focus: () => void } | null>(null)

  const [name, setName] = useState('')
  const [editingTable, setEditingTable] = useState<{ id: string; name: string; is_active: boolean } | null>(null)
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)

  const saveDisabled = !name.trim() || isCreating
  const editDisabled = !editName.trim() || isUpdating

  const handleCreate = () => {
    if (saveDisabled) return
    createTable(name.trim(), { onSuccess: () => { setName(''); createSheetRef.current?.close() } })
  }

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

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
              <Text style={[styles.rowText, !item.is_active && styles.rowTextDisabled]}>
                {item.name}
              </Text>
              <View style={styles.rowActions}>
                <Switch
                  value={item.is_active}
                  onValueChange={(value) => updateTable({ id: item.id, isActive: value })}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={item.is_active ? theme.textPrimary : theme.borderLight}
                />
                <Pressable
                  style={styles.iconButton}
                  onPress={() => {
                    setEditingTable(item)
                    setEditName(item.name)
                    setEditActive(item.is_active)
                    editSheetRef.current?.open()
                  }}
                >
                  <Ionicons name='pencil-outline' size={20} color={theme.textOnPrimary} />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No hay mesas</Text>}
        />
      )}

      <Pressable style={[styles.fab, { bottom: fabBottom }]} onPress={() => createSheetRef.current?.open()}>
        <Ionicons name='add' size={32} color={theme.surface} />
      </Pressable>

      {/* Create table sheet */}
      <AppBottomSheet ref={createSheetRef} snapPoints={SHEET_SNAP.form} onOpen={() => createInputRef.current?.focus()}>
        <Text style={styles.sheetTitle}>Nueva mesa</Text>
        <BottomSheetTextInput
          ref={createInputRef}
          value={name}
          onChangeText={setName}
          placeholder='Nombre de la mesa'
          placeholderTextColor={theme.textMuted}
          style={styles.input}
          returnKeyType='done'
          onSubmitEditing={handleCreate}
        />
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

      {/* Edit table sheet */}
      <AppBottomSheet
        ref={editSheetRef}
        snapPoints={SHEET_SNAP.form}
        onDismiss={() => { setEditingTable(null) }}
        onOpen={() => editInputRef.current?.focus()}
      >
        <Text style={styles.sheetTitle}>Editar mesa</Text>
        <BottomSheetTextInput
          ref={editInputRef}
          value={editName}
          onChangeText={setEditName}
          placeholder='Nombre'
          placeholderTextColor={theme.textMuted}
          style={styles.input}
          returnKeyType='done'
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Activa</Text>
          <Switch value={editActive} onValueChange={setEditActive} />
        </View>
        <View style={styles.actionsRight}>
          <Pressable onPress={() => editSheetRef.current?.close()}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={editDisabled}
            onPress={() => {
              if (!editingTable) return
              updateTable({ id: editingTable.id, name: editName.trim(), isActive: editActive })
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
    row: {
      backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 12,
      borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    rowText: { fontSize: 16, fontWeight: '500', color: theme.textPrimary },
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
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 12 },
    switchLabel: { color: theme.textPrimary, fontSize: 16 },
    actionsRight: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 12 },
    cancel: { color: theme.textPrimary, fontSize: 16 },
    save: {
      color: theme.textOnPrimary, fontSize: 16, fontWeight: '600',
      backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8
    },
    saveDisabled: { opacity: 0.6 }
  })
