import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderItemDraft } from '@/types/types'

interface Props {
  item: OrderItemDraft
  onUpdate: (updates: Partial<OrderItemDraft>) => void
  onRemove: () => void
}

export default function OrderItemComponent({
  item,
  onUpdate,
  onRemove
}: Props) {
  const [modalVisible, setModalVisible] = useState(false)
  const [tempNotes, setTempNotes] = useState(item.notes ?? '')
  const [priceValue, setPriceValue] = useState(String(item.price))

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.notesButton}
        onPress={() => {
          setTempNotes(item.notes ?? '')
          setModalVisible(true)
        }}
      >
        <Ionicons
          name={item.notes ? 'chatbubble' : 'chatbubble-outline'}
          size={18}
          color={item.notes ? '#f1aa1c' : '#130918'}
        />
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => {
            const newQty = Math.max(1, item.quantity - 1)
            onUpdate({ quantity: newQty, price: item.base_price * newQty })
          }}
        >
          <Ionicons name='remove-circle' size={20} color='#130918' />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => {
            const newQty = item.quantity + 1
            onUpdate({ quantity: newQty, price: item.base_price * newQty })
          }}
        >
          <Ionicons name='add-circle' size={20} color='#130918' />
        </TouchableOpacity>
      </View>

      <View style={styles.priceWrapper}>
        <Text style={styles.currency}>$</Text>
        <TextInput
          style={styles.priceInput}
          keyboardType='numeric'
          value={priceValue}
          onChangeText={setPriceValue}
          onEndEditing={() => {
            const value = Number(priceValue) || 0
            onUpdate({ price: value })
          }}
        />
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons name='trash-outline' size={18} color='#F56A57' />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notas</Text>

            <TextInput
              style={styles.modalInput}
              value={tempNotes}
              onChangeText={setTempNotes}
              placeholder='Sin especificaciones'
              multiline
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onUpdate({ notes: tempNotes })
                  setModalVisible(false)
                }}
                style={[styles.modalButton, { backgroundColor: '#f1aa1c' }]}
              >
                <Text style={{ color: '#130918' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 6
  },
  notesButton: {
    padding: 4
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#130918'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center'
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  currency: {
    fontSize: 14,
    color: '#666'
  },
  priceInput: {
    width: 34,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'right'
  },
  removeButton: {
    padding: 4
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#ece2d0',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  }
})
