import React, { useRef, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderDraft, OrderItemDraft } from '@/types/types'
import { useTablesQuery } from '@/hooks/api/tables'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import OrderItemComponent, {
  EditField
} from '@/app/components/OrderItemComponent'
import { useToast } from '@/app/context/ToastContext'
import {
  AppBottomSheet,
  AppBottomSheetRef,
  BottomSheetTextInput,
  SHEET_SNAP
} from '@/app/components/ui/BottomSheet'
import { useOrientation } from '@/app/hooks/useOrientation'
import { BREAKPOINTS, radius, spacing, typography } from '@/app/theme/tokens'

interface Props {
  order: OrderDraft
  total: number
  onChange: (newOrder: OrderDraft) => void
  onSubmit: () => void
  isLoading?: boolean
}

export default function OrderPanel({
  order,
  total,
  onChange,
  onSubmit,
  isLoading
}: Props) {
  // layout-only: wrap controls en paneles estrechos
  const { isPortrait, width } = useOrientation()
  const panelWidth = isPortrait ? width : width / 2
  const isNarrow = panelWidth < BREAKPOINTS.sm
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const { showToast } = useToast()
  const tableSheetRef = useRef<AppBottomSheetRef>(null)
  const editSheetRef = useRef<AppBottomSheetRef>(null)
  const editInputRef = useRef<{ focus: () => void } | null>(null)

  const [editing, setEditing] = useState<{
    index: number
    field: EditField
  } | null>(null)
  const [draftValue, setDraftValue] = useState('')

  const openEditor = (index: number, field: EditField) => {
    const item = order.items[index]
    if (!item) return
    setEditing({ index, field })
    setDraftValue(
      field === 'qty'
        ? String(item.quantity)
        : field === 'price'
          ? String(item.price)
          : (item.notes ?? '')
    )
    editSheetRef.current?.open()
  }

  const saveEdit = () => {
    if (!editing) return
    const { index, field } = editing
    if (field === 'qty') {
      handleUpdateItem(index, {
        quantity: Math.max(1, Number(draftValue) || 1)
      })
    } else if (field === 'price') {
      const value = Number(draftValue) || 0
      handleUpdateItem(index, { price: value, base_price: value })
    } else {
      handleUpdateItem(index, { notes: draftValue })
    }
    editSheetRef.current?.close()
  }

  const { data: tables } = useTablesQuery()

  const scrollRef = useRef<ScrollView | null>(null)
  const prevCountRef = useRef(order.items.length)
  const shouldScrollRef = useRef(false)

  useLayoutEffect(() => {
    if (order.items.length > prevCountRef.current) {
      shouldScrollRef.current = true
    }
    prevCountRef.current = order.items.length
  }, [order.items.length])

  const handleUpdateItem = (
    index: number,
    updates: Partial<OrderItemDraft>
  ) => {
    const updatedItems = [...order.items]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    onChange({ ...order, items: updatedItems })
  }

  const handleRemoveItem = (index: number) => {
    onChange({ ...order, items: order.items.filter((_, i) => i !== index) })
  }

  const handleClearOrder = () => {
    Alert.alert(
      '¿Limpiar orden?',
      'Esta acción eliminará todos los productos de la orden actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            onChange({
              type: 'TAKEAWAY',
              table_id: null,
              customer_name: '',
              table_name: '',
              is_paid: false,
              items: []
            })
            showToast('Orden limpiada', 'success')
          }
        }
      ]
    )
  }

  const handleSelectTable = (table: { id: string; name: string }) => {
    onChange({
      ...order,
      table_id: table.id,
      table_name: table.name,
      type: 'DINE_IN'
    })
    tableSheetRef.current?.close()
  }

  const handleClearTable = () => {
    onChange({ ...order, table_id: null, table_name: '' })
  }

  const canSendToKitchen =
    order.items.length > 0 &&
    (order.customer_name?.trim() !== '' || order.table_id !== null)

  return (
    <View style={styles.wrapper}>
      {/* Input combinado: nombre + mesa */}
      <View style={styles.combinedInput}>
        <Ionicons
          name='person-outline'
          size={18}
          color={theme.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.nameInput}
          value={order.customer_name ?? ''}
          onChangeText={(text) => onChange({ ...order, customer_name: text })}
          placeholder='Nombre del cliente'
          placeholderTextColor={theme.textMuted}
          returnKeyType='done'
        />

        {order.type === 'DINE_IN' && (
          <>
            <View style={styles.inputDivider} />
            {order.table_id ? (
              <View style={styles.tableSelected}>
                <Ionicons
                  name='restaurant-outline'
                  size={15}
                  color={theme.textPrimary}
                />
                <Text style={styles.tableSelectedText} numberOfLines={1}>
                  {order.table_name}
                </Text>
                <TouchableOpacity
                  onPress={handleClearTable}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name='close-circle'
                    size={16}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.tableButton}
                onPress={() => tableSheetRef.current?.open()}
              >
                <Ionicons
                  name='restaurant-outline'
                  size={15}
                  color={theme.textSecondary}
                />
                <Text style={styles.tableButtonText}>Mesa...</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Tipo de orden + Pagado */}
      <View style={[styles.controlsRow, isNarrow && styles.controlsRowNarrow]}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              styles.segmentLeft,
              order.type === 'TAKEAWAY' && styles.segmentActive
            ]}
            onPress={() =>
              onChange({
                ...order,
                type: 'TAKEAWAY',
                table_id: null,
                table_name: ''
              })
            }
          >
            <Text
              style={[
                styles.segmentText,
                order.type === 'TAKEAWAY' && styles.segmentTextActive
              ]}
              allowFontScaling={false}
            >
              Para llevar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              styles.segmentRight,
              order.type === 'DINE_IN' && styles.segmentActive
            ]}
            onPress={() => onChange({ ...order, type: 'DINE_IN' })}
          >
            <Text
              style={[
                styles.segmentText,
                order.type === 'DINE_IN' && styles.segmentTextActive
              ]}
              allowFontScaling={false}
            >
              Comer aquí
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.paidToggle, order.is_paid && styles.paidToggleActive]}
          onPress={() => onChange({ ...order, is_paid: !order.is_paid })}
        >
          <Ionicons
            name={order.is_paid ? 'checkmark-circle' : 'ellipse-outline'}
            size={18}
            color={order.is_paid ? theme.surface : theme.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.paidText, order.is_paid && styles.paidTextActive]}
            allowFontScaling={false}
          >
            Pagado
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.orderItemContainer}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          onContentSizeChange={() => {
            if (shouldScrollRef.current) {
              scrollRef.current?.scrollToEnd({ animated: true })
              shouldScrollRef.current = false
            }
          }}
        >
          {order.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name='cart-outline' size={48} color={theme.border} />
              <Text style={styles.emptyStateText}>
                Agrega productos a la orden
              </Text>
            </View>
          ) : (
            order.items.map((item, index) => (
              <OrderItemComponent
                key={item.uid}
                item={item}
                onUpdate={(updates) => handleUpdateItem(index, updates)}
                onRemove={() => handleRemoveItem(index)}
                onEditField={(field) => openEditor(index, field)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={!canSendToKitchen || isLoading}
          style={[
            styles.submitButton,
            (!canSendToKitchen || isLoading) && styles.disabled
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              size='small'
              color={theme.disabledText}
              style={{ marginRight: 6 }}
            />
          ) : (
            <Ionicons
              name='checkmark-outline'
              size={20}
              color={
                !canSendToKitchen ? theme.disabledText : theme.textOnPrimary
              }
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.submitButtonText,
              (!canSendToKitchen || isLoading) && styles.disabledText
            ]}
          >
            {isLoading ? 'Enviando...' : 'Enviar a cocina'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={order.items.length === 0}
          style={[
            styles.clearButton,
            order.items.length === 0 && styles.disabled
          ]}
          onPress={handleClearOrder}
        >
          <Ionicons
            name='trash'
            size={20}
            color={
              order.items.length === 0 ? theme.disabledText : theme.surface
            }
          />
        </TouchableOpacity>
      </View>

      {/* Item field editor */}
      <AppBottomSheet
        ref={editSheetRef}
        snapPoints={
          editing?.field === 'notes'
            ? SHEET_SNAP.editLong
            : SHEET_SNAP.editShort
        }
        onDismiss={() => {
          setEditing(null)
          setDraftValue('')
        }}
        onOpen={() => editInputRef.current?.focus()}
      >
        {editing && (
          <>
            <Text style={styles.sheetTitle}>
              {editing.field === 'qty'
                ? 'Cantidad'
                : editing.field === 'price'
                  ? 'Precio'
                  : 'Notas'}
            </Text>
            <Text style={styles.editSubtitle} numberOfLines={1}>
              {order.items[editing.index]?.name}
            </Text>
            <BottomSheetTextInput
              ref={editInputRef}
              value={draftValue}
              onChangeText={setDraftValue}
              keyboardType={
                editing.field === 'qty'
                  ? 'number-pad'
                  : editing.field === 'price'
                    ? 'decimal-pad'
                    : 'default'
              }
              multiline={editing.field === 'notes'}
              placeholder={
                editing.field === 'notes' ? 'Sin especificaciones' : undefined
              }
              placeholderTextColor={theme.textMuted}
              style={[
                styles.editInput,
                editing.field === 'notes' && styles.editInputMultiline
              ]}
              returnKeyType={editing.field === 'notes' ? 'default' : 'done'}
              onSubmitEditing={editing.field === 'notes' ? undefined : saveEdit}
              blurOnSubmit={editing.field !== 'notes'}
              selectTextOnFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => editSheetRef.current?.close()}>
                <Text style={styles.editCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={styles.editSave}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </AppBottomSheet>

      {/* Table picker bottom sheet */}
      <AppBottomSheet
        ref={tableSheetRef}
        snapPoints={SHEET_SNAP.list}
        scrollable
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Selecciona una mesa</Text>
          <TouchableOpacity onPress={() => tableSheetRef.current?.close()}>
            <Ionicons name='close' size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tableList}>
          {tables?.map((table) => (
            <TouchableOpacity
              key={table.id}
              style={[
                styles.tableItem,
                order.table_id === table.id && styles.tableItemActive
              ]}
              onPress={() =>
                handleSelectTable({ id: table.id, name: table.name })
              }
            >
              <Ionicons
                name='restaurant-outline'
                size={20}
                color={
                  order.table_id === table.id
                    ? theme.textPrimary
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.tableItemText,
                  order.table_id === table.id && styles.tableItemTextActive
                ]}
              >
                {table.name}
              </Text>
              {table.is_occupied && order.table_id !== table.id && (
                <Text style={styles.occupiedBadge}>ocupada</Text>
              )}
              {order.table_id === table.id && (
                <Ionicons
                  name='checkmark-circle'
                  size={18}
                  color={theme.textPrimary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </AppBottomSheet>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: { flex: 2, padding: 10, backgroundColor: theme.background },
    combinedInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.md,
      backgroundColor: theme.surface,
      marginBottom: spacing.sm,
      paddingHorizontal: 10
    },
    inputIcon: { marginRight: spacing.md },
    nameInput: {
      flex: 1,
      flexShrink: 1,
      paddingVertical: spacing.md,
      ...typography.body,
      color: theme.textPrimary
    },
    inputDivider: {
      width: 1,
      height: '60%',
      backgroundColor: theme.border,
      marginHorizontal: spacing.md
    },
    tableButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md
    },
    tableButtonText: { ...typography.bodySm, color: theme.textSecondary },
    tableSelected: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      maxWidth: 90,
      flexShrink: 1
    },
    tableSelectedText: {
      ...typography.bodySm,
      fontWeight: '600',
      color: theme.textPrimary,
      flex: 1
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: spacing.md,
      marginBottom: spacing.sm
    },
    controlsRowNarrow: { flexWrap: 'wrap' },
    segmentedControl: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      overflow: 'hidden'
    },
    segmentButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center'
    },
    segmentLeft: { borderRightWidth: 1, borderRightColor: theme.border },
    segmentRight: {},
    segmentActive: { backgroundColor: theme.primary },
    segmentText: {
      ...typography.bodySm,
      fontWeight: '600',
      color: theme.textSecondary
    },
    segmentTextActive: { color: theme.textOnPrimary },
    paidToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface
    },
    paidToggleActive: {
      backgroundColor: theme.success,
      borderColor: theme.success
    },
    paidText: {
      ...typography.bodySm,
      fontWeight: '600',
      color: theme.textSecondary
    },
    paidTextActive: { color: theme.surface },
    scrollWrapper: {
      flex: 1,
      borderRadius: radius.md,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden'
    },
    orderItemContainer: { padding: spacing.md, flexGrow: 1 },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md
    },
    emptyStateText: { fontSize: 15, color: theme.textMuted },
    footer: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: spacing.md
    },
    totalAmount: {
      ...typography.display,
      color: theme.textPrimary,
      minWidth: 80,
      textAlign: 'right',
      textAlignVertical: 'center'
    },
    submitButton: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    submitButtonText: {
      color: theme.textOnPrimary,
      fontWeight: 'bold',
      fontSize: 15
    },
    disabledText: { color: theme.disabledText },
    clearButton: {
      width: 46,
      backgroundColor: theme.destructive,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center'
    },
    disabled: { backgroundColor: theme.disabled, opacity: 0.7 },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: spacing.md
    },
    sheetTitle: { ...typography.title, color: theme.textPrimary },
    tableList: { gap: spacing.md },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: spacing.lg,
      paddingHorizontal: 14,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border
    },
    tableItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary
    },
    tableItemText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary
    },
    tableItemTextActive: { color: theme.textOnPrimary },
    occupiedBadge: {
      fontSize: 11,
      color: theme.textMuted,
      fontStyle: 'italic'
    },
    editSubtitle: {
      ...typography.bodySm,
      color: theme.textSecondary,
      marginBottom: spacing.lg
    },
    editInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      backgroundColor: theme.background,
      color: theme.textPrimary,
      fontSize: 16,
      marginBottom: spacing.xl
    },
    editInputMultiline: { minHeight: 80, textAlignVertical: 'top' },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 16
    },
    editCancel: { fontSize: 16, color: theme.textSecondary },
    editSave: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textOnPrimary,
      backgroundColor: theme.primary,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8
    }
  })
