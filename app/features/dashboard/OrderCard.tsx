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
import { useOrderQuery, useOrderUpdateMutation } from '@/hooks/api/orders'
import { printOrder } from '../printing/print'
import { Order, OrderItem } from '@/types/types'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import { useInvalidateDashboard } from '@/hooks/api/dashboard'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Props {
  order: {
    id: number
    customer_name: string
    total: number
    created_at: string
    order_number: string
    status: string
  }
}

export default function OrderCard({ order }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { data: orderData, isLoading } = useOrderQuery(order.id, {
    enabled: expanded,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

  const invalidateDashboard = useInvalidateDashboard()

  const { mutate } = useOrderUpdateMutation(order.id, {
    onSuccess: () => {
      invalidateDashboard()
    }
  })

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((prev) => !prev)
  }

  function mapApiOrderToClientOrder(apiOrder: any): Order {
    return {
      customer_name: apiOrder.customer_name,
      type: apiOrder.type,
      order_number: apiOrder.order_number,
      status: apiOrder.status,
      items: apiOrder.items.map(
        (item: any, index: number): OrderItem => ({
          id: index,
          product: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          basePrice: parseFloat(item.product.price),
          description: item.description || ''
        })
      )
    }
  }

  const handlePrintOrder = async () => {
    const order = mapApiOrderToClientOrder(orderData)
    const success = await printOrder(order)
    if (success) {
      ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
    } else {
      console.error('Error al imprimir la orden')
      ToastAndroid.show('Error al imprimir la orden', ToastAndroid.SHORT)
    }
  }

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>
            {order.customer_name} ({order.order_number})
          </Text>
          <Text style={styles.date}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>

        {expanded && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handlePrintOrder}>
              <Ionicons name='print-outline' size={24} color='#6200ea' />
            </TouchableOpacity>
          </View>
        )}

        {!expanded && (
          <CustomCheckbox
            value={order.status === 'C'}
            onChange={() => {
              mutate({
                payload: { status: 'C' }
              })
            }}
            disabled={order.status === 'C'}
          />
        )}
      </View>

      {expanded && (
        <View style={styles.details}>
          {isLoading ? (
            <ActivityIndicator size='small' color='#6200ea' />
          ) : (
            <>
              {orderData?.items?.map((item: any, i: number) => (
                <View key={i} style={styles.detailRow}>
                  <View>
                    <Text style={styles.productName}>
                      {item.quantity} × {item.product.name}
                    </Text>
                    {item.description ? (
                      <Text style={styles.productDescription}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.productPrice}>${item.price}</Text>
                </View>
              ))}
              <Text style={styles.total}>Total: ${order.total}.00</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ea'
  },
  total: {
    fontWeight: '600',
    color: '#6200ea',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right'
  },
  date: {
    fontSize: 12,
    color: '#888'
  },
  actions: {
    justifyContent: 'center'
  },
  details: {
    marginTop: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'flex-start'
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  },
  productDescription: {
    fontSize: 13,
    color: '#666'
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444'
  }
})
