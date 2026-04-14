import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { Ionicons } from '@expo/vector-icons'
import { useCloseOrderMutation, useOrderQuery } from '@/hooks/api/orders'
import { useStoreQuery } from '@/hooks/api/store'
import { printKitchenOrder, PrintOrder } from '../printing/print'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import { getOrderState, setOrderExpanded, setOrderPaidItem } from './orderStates'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { useToast } from '@/app/context/ToastContext'


interface Props {
  order: {
    id: string
    order_number: string
    type: 'DINE_IN' | 'TAKEAWAY'
    status: 'OPEN' | 'CLOSED' | 'UNPAID'
    customer_name: string | null
    table_name: string | null
    table_id: string | null
    created_at: string
  }
  variant?: 'default' | 'open'
  onOpenOrder?: (orderId: string) => void
  onRemove?: (orderId: string) => void
}

export default function OrderCard({ order, variant = 'default', onOpenOrder, onRemove }: Props) {
  const { showToast } = useToast()
  const { theme } = useTheme()
  const styles = makeStyles(theme)
  const state = getOrderState(order.id)
  const [expanded, setExpanded] = useState(state.expanded)
  const [paidItems, setPaidItems] = useState(state.paidItems)
  const swipeableRef = useRef<Swipeable>(null)
  const canClose = order.status === 'OPEN' || order.status === 'UNPAID'

  useEffect(() => { setOrderExpanded(order.id, expanded) }, [expanded, order.id])

  const toggleItemPaid = (key: string) => {
    const newValue = !paidItems[key]
    setPaidItems((prev) => ({ ...prev, [key]: newValue }))
    setOrderPaidItem(order.id, key, newValue)
  }

  const { data: orderData, isLoading } = useOrderQuery({ order_id: order.id, enabled: expanded })
  const paidTotal = orderData?.items.reduce((acc: number, item: any) => {
    return paidItems[item.id] ? acc + (Number(item.total_price) || 0) : acc
  }, 0) ?? 0

  const { data: storeData } = useStoreQuery()
  const orderTotal = orderData?.items.reduce((acc: number, item: any) => acc + (Number(item.total_price) || 0), 0) ?? 0
  const closeOrderMutation = useCloseOrderMutation()

  const handleCloseOrder = async () => {
    if (closeOrderMutation.isPending) return
    try {
      await closeOrderMutation.mutateAsync({ order_id: order.id, table_id: order.table_id })
      showToast('Orden cerrada', 'success')
      onRemove?.(order.id)
    } catch {
      showToast('Error al cerrar la orden', 'error')
      swipeableRef.current?.close()
    }
  }

  const toggle = () => {
    setExpanded((prev) => !prev)
  }

  const handlePrint = async () => {
    if (!orderData) return
    const printPayload: PrintOrder = {
      order_number: orderData.order_number,
      type: orderData.type,
      customer_name: orderData.customer_name,
      table_name: orderData.table_name,
      is_paid: orderData.status === 'CLOSED',
      items: orderData.items
        .sort((a: any, b: any) => a.product_name.localeCompare(b.product_name, 'es', { sensitivity: 'base' }))
        .map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.base_price,
        notes: item.notes ?? undefined
      }))
    }
    const { success, error } = await printKitchenOrder(printPayload, storeData?.printer_address)
    if (success) {
      showToast('Orden impresa correctamente', 'success')
    } else {
      showToast(`Error al imprimir: ${error}`, 'error')
    }
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

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' })
    const opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.7, 1], extrapolate: 'clamp' })
    return (
      <Animated.View style={[styles.swipeAction, { opacity }]}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
          {closeOrderMutation.isPending
            ? <ActivityIndicator size='small' color='white' />
            : <>
                <Ionicons name='checkmark-done-outline' size={22} color='white' />
                <Text style={styles.swipeText}>Cerrar</Text>
              </>
          }
        </Animated.View>
      </Animated.View>
    )
  }

  const card = (
    <View style={[styles.card, { borderLeftColor: isTakeaway ? '#e0a020' : theme.success }]}>
      <TouchableOpacity onPress={toggle} style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.subtitle}>#{order.order_number} · {formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.headerRight}>
            {orderTotal > 0 && (
              <Text style={styles.totalHeader}>${orderTotal.toFixed(2)}</Text>
            )}
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
                    <CustomCheckbox value={isPaid} onChange={() => toggleItemPaid(itemKey)} />
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, isPaid && styles.itemPaidText]}>
                        {item.quantity} × {item.product_name}
                      </Text>
                      {item.notes ? (
                        <Text style={[styles.itemNotes, isPaid && styles.itemPaidText]}>{item.notes}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.itemPrice, isPaid && styles.itemPaidText]}>
                      ${(Number(item.total_price) || 0).toFixed(2)}
                    </Text>
                  </View>
                )
              })}

              <Text style={styles.summaryText}>Pagado: ${paidTotal.toFixed(2)}</Text>
              <Text style={styles.summaryText}>Pendiente: ${(orderTotal - paidTotal).toFixed(2)}</Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={handlePrint} style={styles.printButton} disabled={closeOrderMutation.isPending}>
                  <Ionicons name='print-outline' size={26} color={theme.textPrimary} />
                </TouchableOpacity>
                {(orderData?.status === 'OPEN' || orderData?.status === 'UNPAID') && (
                  <TouchableOpacity
                    onPress={handleCloseOrder}
                    style={[styles.closeButton, closeOrderMutation.isPending && styles.disabledButton]}
                    disabled={closeOrderMutation.isPending}
                  >
                    <Ionicons name='checkmark-done-outline' size={26} color={theme.textOnPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}
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
    card: { backgroundColor: theme.surface, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3 },
    cardHeader: { padding: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flex: 1, marginRight: 8 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
    subtitle: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
    totalHeader: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
    details: { padding: 12 },
    status: { fontWeight: '500', marginBottom: 6, color: theme.textPrimary },
    summaryText: { textAlign: 'right', color: theme.textSecondary },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    itemName: { fontSize: 14, fontWeight: '500', color: theme.textPrimary },
    itemNotes: { fontSize: 12, color: theme.textSecondary },
    itemPrice: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
    actions: { marginTop: 8, display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', gap: 6 },
    closeButton: { padding: 6, backgroundColor: theme.primary, borderRadius: 6 },
    printButton: { padding: 6, borderRadius: 6 },
    itemInfo: { flex: 1, marginLeft: 6 },
    swipeAction: { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', width: 80, marginBottom: 8, borderRadius: 8 },
    swipeText: { color: 'white', fontSize: 11, fontWeight: '600', marginTop: 2 },
    itemPaidText: { textDecorationLine: 'line-through', color: theme.textMuted },
    disabledButton: { opacity: 0.6 }
  })
