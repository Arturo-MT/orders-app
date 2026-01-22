import React, { useState } from 'react'
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

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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
}

export default function OrderCard({
  order,
  variant = 'default',
  onOpenOrder
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const { data: orderData, isLoading } = useOrderQuery({
    order_id: order.id
  })

  console.log(orderData)

  const { data: storeData } = useStoreQuery()

  const orderTotal =
    orderData?.items.reduce(
      (acc: number, item: any) => acc + Number(item.total_price),
      0
    ) ?? 0

  const closeOrderMutation = useCloseOrderMutation()

  const handleCloseOrder = async () => {
    try {
      await closeOrderMutation.mutateAsync({
        order_id: order.id,
        table_id: order.table_id
      })
      ToastAndroid.show('Orden cerrada', ToastAndroid.SHORT)
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
      items: orderData.items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.base_price,
        notes: item.notes ?? undefined
      }))
    }

    const { success, error } = await printOrder(
      printPayload,
      storeData?.printer_address
    )

    if (success) {
      ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
    } else {
      ToastAndroid.show(`Error al imprimir: ${error}`, ToastAndroid.SHORT)
    }
  }

  return (
    <TouchableOpacity onPress={toggle} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {order.type === 'DINE_IN'
              ? orderData?.table_name
              : (order.customer_name ?? 'Para llevar')}
          </Text>

          <Text style={styles.subtitle}>
            #{order.order_number} ·{' '}
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>

        {variant === 'open' && onOpenOrder && (
          <TouchableOpacity
            onPress={() => onOpenOrder(order.id)}
            style={styles.openButton}
          >
            <Text style={styles.openText}>Abrir</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && (
        <View style={styles.details}>
          {isLoading ? (
            <ActivityIndicator size='small' color='#130918' />
          ) : (
            <>
              <Text style={styles.status}>
                Estado: {orderData?.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </Text>

              {orderData?.items.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <View>
                    <Text style={styles.itemName}>
                      {item.quantity} × {item.product_name}
                    </Text>
                    {item.notes ? (
                      <Text style={styles.itemNotes}>{item.notes}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemPrice}>
                    ${item.total_price.toFixed(2)}
                  </Text>
                </View>
              ))}

              <Text
                style={{
                  textAlign: 'right',
                  width: '100%'
                }}
              >
                Total: ${orderTotal.toFixed(2)}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handlePrint}
                  style={styles.printButton}
                >
                  <Ionicons name='print-outline' size={26} color='#130918' />
                </TouchableOpacity>
                {orderData?.status === 'OPEN' && (
                  <TouchableOpacity
                    onPress={handleCloseOrder}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name='checkmark-done-outline'
                      size={26}
                      color='#130918'
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#130918'
  },
  subtitle: {
    fontSize: 12,
    color: '#666'
  },
  openButton: {
    backgroundColor: '#f1aa1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  openText: {
    fontWeight: '600',
    color: '#130918'
  },
  details: {
    marginTop: 8
  },
  status: {
    fontWeight: '500',
    marginBottom: 6
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500'
  },
  itemNotes: {
    fontSize: 12,
    color: '#666'
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600'
  },
  actions: {
    marginTop: 8,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 6
  },
  closeButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f1aa1c',
    borderRadius: 6
  },
  printButton: {
    marginTop: 8,
    padding: 6,
    borderRadius: 6
  }
})
