import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { Ionicons } from '@expo/vector-icons'
import {
  useOrderQuery,
  useUpdateOrder
} from '@/hooks/api/orders'
import { useUpdateTable } from '@/hooks/api/tables'
import { useElapsedTime } from '@/hooks/utils/useElapsedTime'
import { useTablesQuery } from '@/hooks/api/tables'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import {
  clearOrderState,
  getOrderState,
  setOrderExpanded,
  setOrderPaidItem
} from './orderStates'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { useToast } from '@/app/context/ToastContext'

interface Props {
  order: {
    id: string
    order_number: string
    type: 'DINE_IN' | 'TAKEAWAY'
    status: 'OPEN' | 'PREPARING' | 'DISPATCHED' | 'CLOSED'
    payment_status: string | null
    customer_name: string | null
    table_name: string | null
    table_id: string | null
    created_at: string
    opened_at?: string | null
    prepared_at?: string | null
    dispatched_at?: string | null
  }
  onRemove?: (orderId: string) => void
}

const statusLabel = (status: string) => {
  if (status === 'OPEN') return 'Abierta'
  if (status === 'PREPARING') return 'Preparando'
  if (status === 'DISPATCHED') return 'Despachada'
  if (status === 'CLOSED') return 'Cerrada'
  return status
}

const paymentLabel = (payment: string | null) =>
  payment === 'PAID' ? 'Pagado' : 'Pendiente'

const statusBadge = (status: string, theme: Theme) => {
  if (status === 'OPEN')
    return {
      container: { backgroundColor: '#e0a02022' },
      text: { color: '#e0a020' }
    }
  if (status === 'PREPARING')
    return {
      container: { backgroundColor: '#5b8def22' },
      text: { color: '#5b8def' }
    }
  if (status === 'DISPATCHED')
    return {
      container: { backgroundColor: theme.success + '22' },
      text: { color: theme.success }
    }
  return {
    container: { backgroundColor: theme.borderLight },
    text: { color: theme.textMuted }
  }
}

const paymentBadge = (payment: string | null, theme: Theme) => {
  if (payment === 'PAID')
    return {
      container: { backgroundColor: theme.success + '22' },
      text: { color: theme.success }
    }
  return {
    container: { backgroundColor: '#e0a02022' },
    text: { color: '#e0a020' }
  }
}

export default function OrderCard({ order, onRemove }: Props) {
  const { showToast } = useToast()
  const { theme } = useTheme()
  const styles = makeStyles(theme)
  const state = getOrderState(order.id)
  const [expanded, setExpanded] = useState(state.expanded)
  const [paidItems, setPaidItems] = useState(state.paidItems)
  const [tableModalVisible, setTableModalVisible] = useState(false)
  const swipeableRef = useRef<Swipeable>(null)
  const canClose =
    order.status === 'OPEN' ||
    order.status === 'PREPARING' ||
    order.status === 'DISPATCHED'
  const elapsedLabel = useElapsedTime(order.opened_at ?? order.created_at)

  useEffect(() => {
    setOrderExpanded(order.id, expanded)
  }, [expanded, order.id])

  const toggleItemPaid = (key: string) => {
    const newValue = !paidItems[key]
    setPaidItems((prev) => ({ ...prev, [key]: newValue }))
    setOrderPaidItem(order.id, key, newValue)
  }

  const { data: orderData, isLoading } = useOrderQuery({
    orderId: order.id,
    enabled: expanded
  })
  const paidTotal =
    orderData?.items.reduce((acc: number, item: any) => {
      return paidItems[item.id] ? acc + (Number(item.total_price) || 0) : acc
    }, 0) ?? 0

  const orderTotal =
    orderData?.items.reduce(
      (acc: number, item: any) => acc + (Number(item.total_price) || 0),
      0
    ) ?? 0

  const updateOrder = useUpdateOrder()
  const updateTable = useUpdateTable()
  const { data: tables } = useTablesQuery()

  const handleChangeTable = async (newTableId: string) => {
    setTableModalVisible(false)
    if (newTableId === order.table_id) return
    try {
      await updateOrder.mutateAsync({
        orderId: order.id,
        patch: { table_id: newTableId }
      })
      if (order.table_id) {
        await updateTable.mutateAsync({ id: order.table_id, isOccupied: false })
      }
      await updateTable.mutateAsync({ id: newTableId, isOccupied: true })
      showToast('Mesa actualizada', 'success')
    } catch {
      showToast('Error al cambiar la mesa', 'error')
    }
  }

  const handleReopenOrder = async () => {
    if (updateOrder.isPending) return
    const status = order.dispatched_at
      ? 'DISPATCHED'
      : order.prepared_at
        ? 'PREPARING'
        : 'OPEN'
    try {
      await updateOrder.mutateAsync({
        orderId: order.id,
        patch: { status, payment_status: 'PENDING', closed_at: null }
      })
      if (order.table_id) {
        await updateTable.mutateAsync({ id: order.table_id, isOccupied: true })
      }
      showToast('Orden reabierta', 'success')
    } catch {
      showToast('Error al reabrir la orden', 'error')
    }
  }

  const handleCloseOrder = async () => {
    if (updateOrder.isPending) return
    try {
      await updateOrder.mutateAsync({
        orderId: order.id,
        patch: {
          status: 'CLOSED',
          payment_status: 'PAID',
          closed_at: new Date().toISOString()
        }
      })
      if (order.table_id) {
        await updateTable.mutateAsync({ id: order.table_id, isOccupied: false })
      }
      clearOrderState(order.id)
      showToast('Orden cerrada', 'success')
      onRemove?.(order.id)
    } catch {
      showToast('Error al cerrar la orden', 'error')
      swipeableRef.current?.close()
    }
  }

  const handleMarkAsPaid = async () => {
    if (updateOrder.isPending) return
    try {
      await updateOrder.mutateAsync({
        orderId: order.id,
        patch: { payment_status: 'PAID' }
      })
      showToast('Orden marcada como pagada', 'success')
    } catch {
      showToast('Error al marcar como pagada', 'error')
    }
  }

  const toggle = () => {
    setExpanded((prev) => !prev)
  }

  const displayName = order.table_name || order.customer_name
  const isTakeaway = order.type === 'TAKEAWAY'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const isToday = date.toDateString() === new Date().toDateString()
    return isToday
      ? date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es', { day: '2-digit', month: 'short' })
  }

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
      extrapolate: 'clamp'
    })
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1],
      extrapolate: 'clamp'
    })
    return (
      <Animated.View style={[styles.swipeAction, { opacity }]}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
          {updateOrder.isPending ? (
            <ActivityIndicator size='small' color='white' />
          ) : (
            <>
              <Ionicons name='checkmark-done-outline' size={22} color='white' />
              <Text style={styles.swipeText}>Cerrar</Text>
            </>
          )}
        </Animated.View>
      </Animated.View>
    )
  }

  const card = (
    <View
      style={[
        styles.card,
        { borderLeftColor: isTakeaway ? '#e0a020' : theme.success }
      ]}
    >
      <TouchableOpacity onPress={toggle} style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{displayName}</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle}>
                #{order.order_number} · {formatDate(order.created_at)}
              </Text>
              {canClose && (
                <View style={styles.elapsedBadge}>
                  <Text style={styles.elapsedText}>{elapsedLabel}</Text>
                </View>
              )}
            </View>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  statusBadge(order.status, theme).container
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    statusBadge(order.status, theme).text
                  ]}
                >
                  {statusLabel(order.status)}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  paymentBadge(order.payment_status, theme).container
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    paymentBadge(order.payment_status, theme).text
                  ]}
                >
                  {paymentLabel(order.payment_status)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          {isLoading ? (
            <ActivityIndicator size='small' color={theme.textPrimary} />
          ) : (
            <>
              {orderData?.items.map((item: any) => {
                const itemKey = item.id
                const isPaid = !!paidItems[itemKey]
                return (
                  <View key={itemKey} style={styles.itemRow}>
                    <CustomCheckbox
                      value={isPaid}
                      onChange={() => toggleItemPaid(itemKey)}
                    />
                    <View style={styles.itemInfo}>
                      <Text
                        style={[styles.itemName, isPaid && styles.itemPaidText]}
                      >
                        {item.quantity} × {item.product_name}
                      </Text>
                      {item.notes ? (
                        <Text
                          style={[
                            styles.itemNotes,
                            isPaid && styles.itemPaidText
                          ]}
                        >
                          {item.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      style={[styles.itemPrice, isPaid && styles.itemPaidText]}
                    >
                      ${(Number(item.total_price) || 0).toFixed(2)}
                    </Text>
                  </View>
                )
              })}

              <Text style={styles.summaryText}>
                Pagado: ${paidTotal.toFixed(2)}
              </Text>
              <Text style={styles.summaryText}>
                Pendiente: ${(orderTotal - paidTotal).toFixed(2)}
              </Text>

              <View style={styles.actions}>
                {(orderData?.status === 'OPEN' ||
                  orderData?.status === 'PREPARING' ||
                  orderData?.status === 'DISPATCHED') &&
                  orderData?.payment_status !== 'PAID' && (
                    <TouchableOpacity
                      onPress={handleMarkAsPaid}
                      style={[
                        styles.payButton,
                        updateOrder.isPending && styles.disabledButton
                      ]}
                      disabled={updateOrder.isPending}
                    >
                      {updateOrder.isPending ? (
                        <ActivityIndicator
                          size='small'
                          color={theme.textOnPrimary}
                        />
                      ) : (
                        <Ionicons
                          name='cash-outline'
                          size={26}
                          color={theme.textOnPrimary}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                {orderData?.status === 'CLOSED' && (
                  <TouchableOpacity
                    onPress={handleReopenOrder}
                    style={[
                      styles.reopenButton,
                      updateOrder.isPending && styles.disabledButton
                    ]}
                    disabled={updateOrder.isPending}
                  >
                    {updateOrder.isPending ? (
                      <ActivityIndicator
                        size='small'
                        color={theme.textOnPrimary}
                      />
                    ) : (
                      <Ionicons
                        name='arrow-undo-outline'
                        size={26}
                        color={theme.textOnPrimary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {(orderData?.status === 'OPEN' ||
                  orderData?.status === 'PREPARING' ||
                  orderData?.status === 'DISPATCHED') &&
                  order.type === 'DINE_IN' && (
                    <TouchableOpacity
                      onPress={() => setTableModalVisible(true)}
                      style={styles.tableButton}
                      disabled={updateTable.isPending}
                    >
                      <Ionicons
                        name='restaurant-outline'
                        size={26}
                        color={theme.textPrimary}
                      />
                    </TouchableOpacity>
                  )}
                {(orderData?.status === 'OPEN' ||
                  orderData?.status === 'PREPARING' ||
                  orderData?.status === 'DISPATCHED') && (
                  <TouchableOpacity
                    onPress={handleCloseOrder}
                    style={[
                      styles.closeButton,
                      updateOrder.isPending && styles.disabledButton
                    ]}
                    disabled={updateOrder.isPending}
                  >
                    <Ionicons
                      name='checkmark-done-outline'
                      size={26}
                      color={theme.textOnPrimary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}

      <Modal
        visible={tableModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar mesa</Text>
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
                    table.id === order.table_id && styles.tableItemActive
                  ]}
                  onPress={() => handleChangeTable(table.id)}
                >
                  <Ionicons
                    name='restaurant-outline'
                    size={20}
                    color={
                      table.id === order.table_id
                        ? theme.textOnPrimary
                        : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.tableItemText,
                      table.id === order.table_id && styles.tableItemTextActive
                    ]}
                  >
                    {table.name}
                  </Text>
                  {table.is_occupied && table.id !== order.table_id && (
                    <Text style={styles.occupiedBadge}>ocupada</Text>
                  )}
                  {table.id === order.table_id && (
                    <Ionicons
                      name='checkmark-circle'
                      size={18}
                      color={theme.textOnPrimary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )

  if (!canClose) return card

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={80}
      overshootRight={false}
      onSwipeableOpen={handleCloseOrder}
    >
      {card}
    </Swipeable>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 3
    },
    cardHeader: { padding: 12 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerLeft: { flex: 1, marginRight: 8 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
    subtitle: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
    totalHeader: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
    details: { padding: 12 },
    status: { fontWeight: '500', marginBottom: 6, color: theme.textPrimary },
    summaryText: { textAlign: 'right', color: theme.textSecondary },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
      alignItems: 'center'
    },
    itemName: { fontSize: 14, fontWeight: '500', color: theme.textPrimary },
    itemNotes: { fontSize: 12, color: theme.textSecondary },
    itemPrice: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
    actions: {
      marginTop: 8,
      justifyContent: 'flex-end',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6
    },
    closeButton: {
      padding: 6,
      backgroundColor: theme.primary,
      borderRadius: 6
    },
    payButton: {
      padding: 6,
      backgroundColor: theme.success,
      borderRadius: 6
    },
    itemInfo: { flex: 1, marginLeft: 6 },
    swipeAction: {
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginBottom: 8,
      borderRadius: 8
    },
    swipeText: {
      color: 'white',
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2
    },
    itemPaidText: {
      textDecorationLine: 'line-through',
      color: theme.textMuted
    },
    disabledButton: { opacity: 0.6 },
    reopenButton: {
      width: 42,
      height: 42,
      backgroundColor: theme.textSecondary,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center'
    },
    tableButton: {
      width: 42,
      height: 42,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.overlay
    },
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
    tableItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary
    },
    tableItemOccupied: { opacity: 0.5 },
    tableItemText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary
    },
    tableItemTextActive: { color: theme.textOnPrimary },
    tableItemTextMuted: { color: theme.textMuted },
    occupiedBadge: {
      fontSize: 11,
      color: theme.textMuted,
      fontStyle: 'italic'
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2
    },
    elapsedBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
      backgroundColor: theme.borderLight
    },
    elapsedText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary
    },
    badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 11, fontWeight: '700' }
  })
