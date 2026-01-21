import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions
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
  const [showNotes, setShowNotes] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tempNotes, setTempNotes] = useState(item.notes ?? '')

  const isSmallDevice = Dimensions.get('window').width < 768

  return (
    <View style={styles.column}>
      {/* ---------- header ---------- */}
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.iconsWrapper}>
          <TouchableOpacity
            onPress={() => {
              if (isSmallDevice) {
                setTempNotes(item.notes ?? '')
                setModalVisible(true)
              } else {
                setShowNotes(!showNotes)
              }
            }}
          >
            <Ionicons name='chatbubble-outline' size={22} color='#130918' />
          </TouchableOpacity>

          <TouchableOpacity onPress={onRemove}>
            <Ionicons name='trash-outline' size={22} color='#130918' />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- notes preview ---------- */}
      {(item.notes || showNotes) && (
        <View style={styles.notesWrapper}>
          <Text style={styles.notesText}>
            {item.notes || 'Sin especificaciones'}
          </Text>
        </View>
      )}

      {/* ---------- quantity + price ---------- */}
      <View style={styles.row}>
        <View style={styles.quantityWrapper}>
          <TouchableOpacity
            disabled={item.quantity <= 1}
            onPress={() => onUpdate({ quantity: item.quantity - 1 })}
          >
            <Ionicons name='remove-circle-outline' size={22} color='#130918' />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { width: 40 }]}
            keyboardType='numeric'
            value={String(item.quantity)}
            onChangeText={(value) => onUpdate({ quantity: Number(value) || 1 })}
          />

          <TouchableOpacity
            onPress={() => onUpdate({ quantity: item.quantity + 1 })}
          >
            <Ionicons name='add-circle-outline' size={22} color='#130918' />
          </TouchableOpacity>
        </View>

        <View style={styles.priceWrapper}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            keyboardType='numeric'
            value={String(item.price)}
            onChangeText={(value) => onUpdate({ price: Number(value) || 0 })}
          />
        </View>
      </View>

      {/* ---------- notes input (desktop) ---------- */}
      {showNotes && !isSmallDevice && (
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={item.notes ?? ''}
          onChangeText={(value) => onUpdate({ notes: value })}
          placeholder='Especificaciones'
        />
      )}

      {/* ---------- notes modal (mobile) ---------- */}
      {isSmallDevice && (
        <Modal
          visible={modalVisible}
          animationType='slide'
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Especificaciones</Text>

              <TextInput
                style={styles.modalInput}
                value={tempNotes}
                onChangeText={setTempNotes}
                placeholder='Escribe aquí...'
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
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 24,
    flexWrap: 'wrap'
  },
  iconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  column: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10
  },
  name: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 2,
    borderRadius: 5,
    minWidth: 50,
    textAlign: 'center',
    backgroundColor: '#fff'
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
  notesInput: {
    flexBasis: '100%',
    marginTop: 8
  },
  notesWrapper: {
    paddingLeft: 8,
    paddingBottom: 6
  },

  notesText: {
    fontSize: 14,
    color: '#130918'
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  modalButton: {
    padding: 10,
    borderRadius: 6
  },
  especification: {
    fontSize: 14,
    color: '#130918'
  },
  descriptionWrapper: {
    paddingLeft: 8
  }
})
