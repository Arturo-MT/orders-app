import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  useWindowDimensions
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
  isLoading?: boolean
}

export default function OrderPanel({ order, total, onChange, onPrint, isLoading }: Props) {
  const { width, height } = useWindowDimensions()
  const isPortrait = height >= width
  const panelWidth = isPortrait ? width : (width * 2) / 3
  const isNarrow = panelWidth < 400

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
    (order.customer_name?.trim() !== '' || order.table_id !== null)

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.customerNameInput}
        value={order.customer_name ?? ''}
        onChangeText={(text) => onChange({ ...order, customer_name: text })}
        placeholder='Nombre del cliente'
      />

      {order.type === 'DINE_IN' && (
        <TablePicker
          value={order.table_id}
          onChange={(table) => {
            onChange({
              ...order,
              table_id: table.id,
              table_name: table.name,
              type: 'DINE_IN'
            })
          }}
        />
      )}

      <View style={styles.typeOrderWrapper}>
        <TouchableOpacity
          style={styles.typeOption}
          onPress={() => onChange({ ...order, type: 'TAKEAWAY' })}
        >
          <CustomCheckbox
            value={order.type === 'TAKEAWAY'}
            onChange={() => onChange({ ...order, type: 'TAKEAWAY' })}
          />
          <Text style={styles.typeOptionLabel}>Para llevar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.typeOption}
          onPress={() => onChange({ ...order, type: 'DINE_IN' })}
        >
          <CustomCheckbox
            value={order.type === 'DINE_IN'}
            onChange={() => onChange({ ...order, type: 'DINE_IN' })}
          />
          <Text style={styles.typeOptionLabel}>Para comer aquí</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.typeOption}
          onPress={() => onChange({ ...order, is_paid: !order.is_paid })}
        >
          <CustomCheckbox
            value={!!order.is_paid}
            onChange={(checked) => onChange({ ...order, is_paid: checked })}
          />
          <Text style={styles.typeOptionLabel}>Pagado</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.buttonsWrapper, isNarrow && styles.buttonsWrapperNarrow]}>
        <Text style={styles.orderTitle}>Total: ${total.toFixed(2)}</Text>

        <TouchableOpacity
          onPress={onPrint}
          disabled={!canSendToKitchen || isLoading}
          style={[styles.printButton, (!canSendToKitchen || isLoading) && styles.disabled]}
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
                      type: 'TAKEAWAY',
                      table_id: null,
                      customer_name: '',
                      table_name: '',
                      is_paid: false,
                      items: []
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
          {order.items.length === 0 ? (
            <View style={styles.emptyState}>
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
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  typeOptionLabel: {
    fontSize: 14,
    color: '#130918'
  },
  customerNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 10
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
  buttonsWrapperNarrow: {
    flexWrap: 'wrap'
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
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999'
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
