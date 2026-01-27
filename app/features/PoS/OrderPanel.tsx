import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderDraft, OrderItemDraft } from '@/types/types'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import OrderItemComponent from '@/app/components/OrderItemComponent'
import TablePicker from './TablePicker'

interface Props {
  order: OrderDraft
  total: number
  onChange: (newOrder: OrderDraft) => void
  onPrint: () => void
}

export default function OrderPanel({ order, total, onChange, onPrint }: Props) {
  const scrollRef = useRef<ScrollView | null>(null)
  const prevCountRef = useRef(order.items.length)
  const shouldScrollRef = useRef(false)

  useEffect(() => {
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
    updatedItems[index] = {
      ...updatedItems[index],
      ...updates
    }
    onChange({ ...order, items: updatedItems })
  }

  const handleRemoveItem = (index: number) => {
    onChange({
      ...order,
      items: order.items.filter((_, i) => i !== index)
    })
  }

  const canSendToKitchen =
    order.items.length > 0 &&
    ((order.type === 'TAKEAWAY' && order.customer_name?.trim() !== '') ||
      (order.type === 'DINE_IN' && !!order.table_id))

  return (
    <View style={styles.wrapper}>
      {order.type === 'TAKEAWAY' && (
        <TextInput
          style={styles.customerNameInput}
          value={order.customer_name ?? ''}
          onChangeText={(text) => onChange({ ...order, customer_name: text })}
          placeholder='Nombre del cliente'
        />
      )}

      {order.type === 'DINE_IN' && (
        <TablePicker
          value={order.table_id}
          onChange={(table) =>
            onChange({
              ...order,
              table_id: table.id,
              table_name: table.name
            })
          }
        />
      )}

      <View style={styles.typeOrderWrapper}>
        <Text>Para llevar</Text>
        <CustomCheckbox
          value={order.type === 'TAKEAWAY'}
          onChange={() =>
            onChange({
              ...order,
              type: 'TAKEAWAY'
            })
          }
        />

        <Text>Para comer aquí</Text>
        <CustomCheckbox
          value={order.type === 'DINE_IN'}
          onChange={() =>
            onChange({
              ...order,
              type: 'DINE_IN',
              customer_name: ''
            })
          }
        />
      </View>

      <View style={styles.buttonsWrapper}>
        <Text style={styles.orderTitle}>Total: ${total}</Text>

        <TouchableOpacity
          onPress={onPrint}
          disabled={!canSendToKitchen}
          style={[styles.printButton, !canSendToKitchen && styles.disabled]}
        >
          <Ionicons
            name='print'
            size={22}
            color='#130918'
            style={{ marginRight: 6 }}
          />
          <Text style={styles.printButtonText}>Enviar a cocina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={order.items.length === 0}
          style={[
            styles.clearButton,
            order.items.length === 0 && styles.disabled
          ]}
          onPress={() =>
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
                      ...order,
                      items: [],
                      customer_name: ''
                    })
                    ToastAndroid.show('Orden limpiada', ToastAndroid.SHORT)
                  }
                }
              ]
            )
          }
        >
          <Ionicons name='trash' size={22} style={styles.buttonTrashIcon} />
        </TouchableOpacity>
      </View>

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
          {order.items.map((item, index) => (
            <OrderItemComponent
              key={item.uid}
              item={item}
              onUpdate={(updates) => handleUpdateItem(index, updates)}
              onRemove={() => handleRemoveItem(index)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 2,
    padding: 10,
    backgroundColor: '#ece2d0'
  },
  typeOrderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10
  },
  customerNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff'
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonsWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
    alignItems: 'center'
  },
  printButton: {
    flex: 1,
    backgroundColor: '#f1aa1c',
    borderRadius: 5,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearButton: {
    padding: 4,
    backgroundColor: '#F56A57',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  printButtonText: {
    color: '#130918',
    fontWeight: 'bold'
  },
  scrollWrapper: {
    flex: 1
  },
  orderItemContainer: {
    padding: 10,
    backgroundColor: '#ece2d0',
    flexGrow: 1
  },
  buttonTrashIcon: {
    color: '#130918'
  }
})
