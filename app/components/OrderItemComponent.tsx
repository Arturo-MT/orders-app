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

interface Props {
  item: {
    name: string
    quantity: number
    price: number
    basePrice: number
    description?: string
  }
  onUpdate: (updates: Partial<Props['item']>) => void
  onRemove: () => void
}

export default function OrderItemComponent({
  item,
  onUpdate,
  onRemove
}: Props) {
  const [showComment, setShowComment] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tempComment, setTempComment] = useState(item.description)

  const isSmallDevice = Dimensions.get('window').width < 768

  return (
    <View style={styles.column}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.iconsWrapper}>
          <TouchableOpacity
            onPress={() => {
              if (isSmallDevice) {
                setTempComment(item.description || '')
                setModalVisible(true)
              } else {
                setShowComment(!showComment)
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

      <View style={styles.descriptionWrapper}>
        <Text style={styles.especification}>
          {item.description || 'Con todo'}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.quantityWrapper}>
          <TouchableOpacity
            onPress={() =>
              onUpdate({
                quantity: item.quantity - 1,
                price: item.basePrice * (item.quantity - 1)
              })
            }
            style={{ marginLeft: 8 }}
            disabled={item.quantity <= 1}
          >
            <Ionicons name='remove-circle-outline' size={22} color='#130918' />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { width: 40 }]}
            keyboardType='numeric'
            value={String(item.quantity)}
            onChangeText={(value) =>
              onUpdate({
                quantity: parseInt(value) || 0
              })
            }
            placeholder='Cantidad'
          />
          <TouchableOpacity
            onPress={() =>
              onUpdate({
                quantity: item.quantity + 1,
                price: item.basePrice * (item.quantity + 1)
              })
            }
            style={{ marginLeft: 8 }}
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
            onChangeText={(value) => {
              const newPrice = parseInt(value) || 0
              onUpdate({ price: newPrice })
            }}
            placeholder='Precio'
          />
        </View>
      </View>

      {showComment && !isSmallDevice && (
        <TextInput
          style={[styles.input, styles.commentInput]}
          value={item.description}
          onChangeText={(value) => onUpdate({ description: value })}
          placeholder='Especificaciones'
        />
      )}

      {isSmallDevice && (
        <Modal
          visible={modalVisible}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Especificaciones</Text>
              <TextInput
                style={styles.modalInput}
                value={tempComment}
                onChangeText={setTempComment}
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
                    onUpdate({ description: tempComment })
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
  commentInput: {
    flexBasis: '100%',
    marginTop: 8
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
