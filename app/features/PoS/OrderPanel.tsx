import React, { useRef, useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  useWindowDimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderDraft, OrderItemDraft } from '@/types/types'
import { useTablesQuery } from '@/hooks/api/tables'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import OrderItemComponent from '@/app/components/OrderItemComponent'
import { useToast } from '@/app/context/ToastContext'

interface Props {
  order: OrderDraft
  total: number
  onChange: (newOrder: OrderDraft) => void
  onPrint: () => void
  isLoading?: boolean
}

export default function OrderPanel({
  order,
  total,
  onChange,
  onPrint,
  isLoading
}: Props) {
  const { width, height } = useWindowDimensions()
  const isPortrait = height >= width
  const panelWidth = isPortrait ? width : width / 2
  const isNarrow = panelWidth < 400
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const { showToast } = useToast()
  const [tableModalVisible, setTableModalVisible] = useState(false)

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

  const handleUpdateItem = (index: number, updates: Partial<OrderItemDraft>) => {
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
    onChange({ ...order, table_id: table.id, table_name: table.name, type: 'DINE_IN' })
    setTableModalVisible(false)
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
        <Ionicons name='person-outline' size={18} color={theme.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.nameInput}
          value={order.customer_name ?? ''}
          onChangeText={(text) => onChange({ ...order, customer_name: text })}
          placeholder='Nombre del cliente'
          placeholderTextColor={theme.textMuted}
        />

        {order.type === 'DINE_IN' && (
          <>
            <View style={styles.inputDivider} />
            {order.table_id ? (
              <View style={styles.tableSelected}>
                <Ionicons name='restaurant-outline' size={15} color={theme.textPrimary} />
                <Text style={styles.tableSelectedText} numberOfLines={1}>{order.table_name}</Text>
                <TouchableOpacity onPress={handleClearTable} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name='close-circle' size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.tableButton} onPress={() => setTableModalVisible(true)}>
                <Ionicons name='restaurant-outline' size={15} color={theme.textSecondary} />
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
            style={[styles.segmentButton, styles.segmentLeft, order.type === 'TAKEAWAY' && styles.segmentActive]}
            onPress={() => onChange({ ...order, type: 'TAKEAWAY', table_id: null, table_name: '' })}
          >
            <Text style={[styles.segmentText, order.type === 'TAKEAWAY' && styles.segmentTextActive]}>
              Para llevar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, styles.segmentRight, order.type === 'DINE_IN' && styles.segmentActive]}
            onPress={() => onChange({ ...order, type: 'DINE_IN' })}
          >
            <Text style={[styles.segmentText, order.type === 'DINE_IN' && styles.segmentTextActive]}>
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
          <Text style={[styles.paidText, order.is_paid && styles.paidTextActive]}>Pagado</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.orderItemContainer}
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
              <Text style={styles.emptyStateText}>Agrega productos a la orden</Text>
            </View>
          ) : (
            order.items.map((item, index) => (
              <OrderItemComponent
                key={item.uid}
                item={item}
                onUpdate={(updates) => handleUpdateItem(index, updates)}
                onRemove={() => handleRemoveItem(index)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>

        <TouchableOpacity
          onPress={onPrint}
          disabled={!canSendToKitchen || isLoading}
          style={[styles.printButton, (!canSendToKitchen || isLoading) && styles.disabled]}
        >
          {isLoading ? (
            <ActivityIndicator size='small' color={theme.disabledText} style={{ marginRight: 6 }} />
          ) : (
            <Ionicons
              name='print'
              size={20}
              color={!canSendToKitchen ? theme.disabledText : theme.textOnPrimary}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={[styles.printButtonText, (!canSendToKitchen || isLoading) && styles.disabledText]}>
            {isLoading ? 'Enviando...' : 'Enviar a cocina'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={order.items.length === 0}
          style={[styles.clearButton, order.items.length === 0 && styles.disabled]}
          onPress={handleClearOrder}
        >
          <Ionicons
            name='trash'
            size={20}
            color={order.items.length === 0 ? theme.disabledText : theme.surface}
          />
        </TouchableOpacity>
      </View>

      {/* Modal de mesas */}
      <Modal
        visible={tableModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una mesa</Text>
              <TouchableOpacity onPress={() => setTableModalVisible(false)}>
                <Ionicons name='close' size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.tableList}>
              {tables?.map((table) => (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    styles.tableItem,
                    order.table_id === table.id && styles.tableItemActive
                  ]}
                  onPress={() => handleSelectTable({ id: table.id, name: table.name })}
                >
                  <Ionicons
                    name='restaurant-outline'
                    size={20}
                    color={order.table_id === table.id ? theme.textPrimary : theme.textSecondary}
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
                    <Ionicons name='checkmark-circle' size={18} color={theme.textPrimary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      borderRadius: 8,
      backgroundColor: theme.surface,
      marginBottom: 6,
      paddingHorizontal: 10
    },
    inputIcon: { marginRight: 8 },
    nameInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: theme.textPrimary },
    inputDivider: { width: 1, height: '60%', backgroundColor: theme.border, marginHorizontal: 8 },
    tableButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
    tableButtonText: { fontSize: 13, color: theme.textSecondary },
    tableSelected: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, maxWidth: 110 },
    tableSelectedText: { fontSize: 13, fontWeight: '600', color: theme.textPrimary, flex: 1 },
    controlsRow: { flexDirection: 'row', alignItems: 'stretch', gap: 8, marginBottom: 6 },
    controlsRowNarrow: { flexWrap: 'wrap' },
    segmentedControl: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      overflow: 'hidden'
    },
    segmentButton: { flex: 1, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
    segmentLeft: { borderRightWidth: 1, borderRightColor: theme.border },
    segmentRight: {},
    segmentActive: { backgroundColor: theme.primary },
    segmentText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    segmentTextActive: { color: theme.textOnPrimary },
    paidToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface
    },
    paidToggleActive: { backgroundColor: theme.success, borderColor: theme.success },
    paidText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    paidTextActive: { color: theme.surface },
    scrollWrapper: {
      flex: 1,
      borderRadius: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden'
    },
    orderItemContainer: { padding: 8, flexGrow: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    emptyStateText: { fontSize: 15, color: theme.textMuted },
    footer: { marginTop: 8, flexDirection: 'row', alignItems: 'stretch', gap: 8 },
    totalAmount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      minWidth: 80,
      textAlign: 'right',
      textAlignVertical: 'center'
    },
    printButton: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    printButtonText: { color: theme.textOnPrimary, fontWeight: 'bold', fontSize: 15 },
    disabledText: { color: theme.disabledText },
    clearButton: { width: 46, backgroundColor: theme.destructive, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    disabled: { backgroundColor: theme.disabled, opacity: 0.7 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.overlay },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '60%',
      paddingBottom: 20
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },
    modalTitle: { fontSize: 17, fontWeight: 'bold', color: theme.textPrimary },
    tableList: { padding: 12, gap: 8 },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border
    },
    tableItemActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    tableItemOccupied: { opacity: 0.5 },
    tableItemText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.textPrimary },
    tableItemTextActive: { color: theme.textOnPrimary },
    tableItemTextOccupied: { color: theme.textMuted },
    occupiedBadge: { fontSize: 11, color: theme.textMuted, fontStyle: 'italic' }
  })
