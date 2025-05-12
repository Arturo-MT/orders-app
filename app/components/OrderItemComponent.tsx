// components/OrderItemComponent.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  item: {
    id: number
    name: string
    quantity: number
    price: number
    basePrice: number
    description?: string
  }
  onUpdate: (id: number, updates: Partial<Props['item']>) => void
  onRemove: (id: number) => void
}

export default function OrderItemComponent({
  item,
  onUpdate,
  onRemove
}: Props) {
  const [showComment, setShowComment] = useState(false)

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.quantityWrapper}>
        <TouchableOpacity
          onPress={() =>
            onUpdate(item.id, {
              quantity: item.quantity - 1,
              price: item.basePrice * (item.quantity - 1)
            })
          }
          style={{ marginLeft: 8 }}
          disabled={item.quantity <= 1}
        >
          <Ionicons name='remove-circle-outline' size={22} color='#e53935' />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          keyboardType='numeric'
          value={String(item.quantity)}
          onChangeText={(value) =>
            onUpdate(item.id, { quantity: parseInt(value) || 0 })
          }
          placeholder='Cantidad'
        />
        <TouchableOpacity
          onPress={() =>
            onUpdate(item.id, {
              quantity: item.quantity + 1,
              price: item.basePrice * (item.quantity + 1)
            })
          }
          style={{ marginLeft: 8 }}
        >
          <Ionicons name='add-circle-outline' size={22} color='#007bff' />
        </TouchableOpacity>
      </View>

      <View style={styles.priceWrapper}>
        <Text style={styles.currency}>$</Text>
        <TextInput
          style={[styles.input, styles.priceInput]}
          keyboardType='numeric'
          value={String(item.price)}
          onChangeText={(value) =>
            onUpdate(item.id, { price: parseFloat(value) || 0 })
          }
          placeholder='Precio'
        />
      </View>

      <TouchableOpacity onPress={() => setShowComment(!showComment)}>
        <Ionicons name='chatbubble-outline' size={22} color='#007bff' />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onRemove(item.id)}>
        <Ionicons name='trash-outline' size={22} color='#e53935' />
      </TouchableOpacity>

      {showComment && (
        <TextInput
          style={[styles.input, styles.commentInput]}
          value={item.description}
          onChangeText={(value) => onUpdate(item.id, { description: value })}
          placeholder='Especificaciones'
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 24,
    flexWrap: 'wrap'
  },
  name: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 5,
    minWidth: 50,
    textAlign: 'center'
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currency: {
    fontSize: 16,
    marginRight: 2
  },
  priceInput: {
    minWidth: 60
  },
  commentInput: {
    flexBasis: '100%',
    marginTop: 8
  }
})
