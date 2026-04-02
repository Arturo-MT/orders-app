import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  ToastAndroid
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCloseOrderMutation, useOrderQuery } from '@/hooks/api/orders'
import { useStoreQuery } from '@/hooks/api/store'
import { printOrder, PrintOrder } from '../printing/print'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import { getOrderState, setOrderExpanded, setOrderPaidItem } from './orderStates'
import { theme } from '@/constants/Colors'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Props {
  order: {
    id: string
    order_number: string
    type: 'DINE_IN' | 'TAKEAWAY'
    status: 'OPEN' | 'CLOSED'
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
  const state = getOrderState(order.id)
  const [expanded, setExpanded] = useState(state.expanded)
  const [paidItems, setPaidItems] = useState(state.paidItems)

  useEffect(() => { setOrderExpanded(order.id, expanded) }, [expanded, order.id])

  useEffect(() => {
    Object.entries(paidItems).forEach(([key, value]) => {
      setOrderPaidItem(order.id, key, value)
    })
  }, [paidItems, order.id])

  const toggleItemPaid = (key: string) => {
    setPaidItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const { data: orderData, isLoading } = useOrderQuery({ order_id: order.id })
  const paidTotal = orderData?.items.reduce((acc: number, item: any, i: number) => {
    const key = `${item.product_name}-${i}`
    return paidItems[key] ? acc + Number(item.total_price) : acc
  }, 0) ?? 0

  const { data: storeData } = useStoreQuery()
  const orderTotal = orderData?.items.reduce((acc: number, item: any) => acc + Number(item.total_price), 0) ?? 0
  const closeOrderMutation = useCloseOrderMutation()

  const handleCloseOrder = async () => {
    try {
      await closeOrderMutation.mutateAsync({ order_id: order.id, table_id: order.table_id })
      ToastAndroid.show('Orden cerrada', ToastAndroid.SHORT)
      onRemove?.(order.id)
    } catch {
      ToastAndroid.show('Error al cerrar la orden', ToastAndroid.SHORT)
    }
  }

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
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
      items: orderData.items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.base_price,
        notes: item.notes ?? undefined
      }))
    }
    const { success, error } = await printOrder(printPayload, storeData?.printer_address)
    if (success) {
      ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
    } else {
      ToastAndroid.show(`Error al imprimir: ${error}`, ToastAndroid.SHORT)
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggle} style={styles.cardHeader}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>(#{order.order_number}) {order.customer_name}</Text>
            <Text style={styles.subtitle}>{new Date(order.created_at).toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          {isLoading ? (
            <ActivityIndicator size='small' color={theme.textPrimary} />
          ) : (
            <>
              <Text style={styles.status}>{orderData?.table_name || orderData?.customer_name}</Text>
              <Text style={styles.status}>Estado: {orderData?.status === 'OPEN' || orderData?.status === 'UNPAID' ? 'Abierta' : 'Cerrada'}</Text>
              <Text style={styles.status}>Tipo: {orderData?.type === 'TAKEAWAY' ? 'Para llevar' : 'Para aqui'}</Text>

              {orderData?.items.map((item: any, i: number) => {
                const itemKey = `${item.product_name}-${i}`
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
                      ${item.total_price.toFixed(2)}
                    </Text>
                  </View>
                )
              })}

              <Text style={{ textAlign: 'right' }}>Pagado: ${paidTotal.toFixed(2)}</Text>
              <Text style={{ textAlign: 'right' }}>Pendiente: ${(orderTotal - paidTotal).toFixed(2)}</Text>

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
                    <Ionicons name='checkmark-done-outline' size={26} color={theme.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.surface, borderRadius: 8, marginBottom: 10 },
  cardHeader: { backgroundColor: theme.borderLight, padding: 12, borderRadius: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: theme.textPrimary },
  subtitle: { fontSize: 12, color: theme.textSecondary },
  openButton: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  openText: { fontWeight: '600', color: theme.textPrimary },
  details: { padding: 12 },
  status: { fontWeight: '500', marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '500' },
  itemNotes: { fontSize: 12, color: theme.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  actions: { marginTop: 8, display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', gap: 6 },
  closeButton: { marginTop: 8, padding: 6, backgroundColor: theme.primary, borderRadius: 6 },
  printButton: { marginTop: 8, padding: 6, borderRadius: 6 },
  itemInfo: { flex: 1, marginLeft: 6 },
  itemPaidText: { textDecorationLine: 'line-through', color: theme.textMuted },
  disabledButton: { opacity: 0.6 }
})
