import React from 'react'
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
import { Order, OrderItem } from '@/types/types'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import OrderItemComponent from '@/app/components/OrderItemComponent'

interface Props {
  order: Order
  total: number
  onChange: (newOrder: Order) => void
  onPrint: () => void
}

export default function OrderPanel({ order, total, onChange, onPrint }: Props) {
  const handleUpdateItem = (index: number, updates: Partial<OrderItem>) => {
    const updatedItems = [...order.items]
    const safeUpdates = {
      ...updates,
      price:
        updates.price !== undefined
          ? Number(updates.price)
          : updatedItems[index].price
    }
    updatedItems[index] = { ...updatedItems[index], ...safeUpdates }
    onChange({ ...order, items: updatedItems })
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = order.items.filter((_, i) => i !== index)
    onChange({ ...order, items: updatedItems })
  }

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder='Nombre del cliente'
        style={styles.customerNameInput}
        onChangeText={(text) => onChange({ ...order, customer_name: text })}
        value={order.customer_name}
      />
      <View style={styles.typeOrderWrapper}>
        <Text>Para llevar:</Text>
        <CustomCheckbox
          value={order.type === 'T'}
          onChange={() => onChange({ ...order, type: 'T' })}
        />
        <Text>Para comer aquí:</Text>
        <CustomCheckbox
          value={order.type === 'F'}
          onChange={() => onChange({ ...order, type: 'F' })}
        />
        <Text>Pagado:</Text>
        <CustomCheckbox
          value={order.status === 'C'}
          onChange={() =>
            onChange({
              ...order,
              status: order.status === 'C' ? 'P' : 'C'
            })
          }
        />
      </View>

      <Text style={styles.orderTitle}>Total: ${total}</Text>

      <View style={styles.buttonsWrapper}>
        <TouchableOpacity
          onPress={onPrint}
          style={[
            styles.printButton,
            (order.items.length === 0 || order.customer_name === '') &&
              styles.disabled
          ]}
          disabled={order.items.length === 0 || order.customer_name === ''}
        >
          <Ionicons
            name='print'
            size={22}
            color='#fff'
            style={{ marginRight: 6 }}
          />
          <Text style={styles.printButtonText}>Imprimir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              '¿Limpiar orden?',
              'Esta acción eliminará todos los productos de la orden actual.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Limpiar',
                  onPress: () => {
                    onChange({
                      customer_name: '',
                      type: 'F',
                      items: [],
                      order_number: '',
                      status: 'P'
                    })
                    ToastAndroid.show('Orden limpiada', ToastAndroid.SHORT)
                  },
                  style: 'destructive'
                }
              ]
            )
          }}
          style={[
            styles.clearButton,
            order.items.length === 0 && styles.disabled
          ]}
          disabled={order.items.length === 0}
        >
          <Ionicons name='trash' size={22} color='#fff' />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollWrapper}>
        <ScrollView contentContainerStyle={styles.orderItemContainer}>
          {order.items.map((item, index) => (
            <OrderItemComponent
              key={item.id}
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
    backgroundColor: '#f0f0f0'
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
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearButton: {
    padding: 10,
    backgroundColor: '#e53935',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  printButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  scrollWrapper: {
    flex: 1
  },
  orderItemContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexGrow: 1
  }
})
