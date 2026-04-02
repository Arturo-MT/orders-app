import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderItemDraft } from '@/types/types'
import { theme } from '@/constants/Colors'

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
  const { width, height } = useWindowDimensions()
  const isPortrait = height >= width
  const panelWidth = isPortrait ? width : width / 2
  const isSmallDevice = panelWidth < 480
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [qtyModalVisible, setQtyModalVisible] = useState(false)
  const [priceModalVisible, setPriceModalVisible] = useState(false)
  const [tempNotes, setTempNotes] = useState(item.notes ?? '')
  const [tempQty, setTempQty] = useState(String(item.quantity))
  const [tempPrice, setTempPrice] = useState(String(item.price))

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          setTempNotes(item.notes ?? '')
          setNotesModalVisible(true)
        }}
      >
        <Ionicons
          name={item.notes ? 'chatbubble' : 'chatbubble-outline'}
          size={18}
          color={item.notes ? theme.primary : theme.textPrimary}
        />
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          disabled={item.quantity <= 1}
          onPress={() => {
            const newQty = item.quantity - 1
            onUpdate({ quantity: newQty, price: item.base_price * newQty })
          }}
        >
          <Ionicons
            name='remove-circle'
            size={20}
            color={item.quantity <= 1 ? theme.disabled : theme.textPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTempQty(String(item.quantity))
            setQtyModalVisible(true)
          }}
        >
          <Text style={styles.quantityText}>{item.quantity}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const newQty = item.quantity + 1
            onUpdate({ quantity: newQty, price: item.base_price * newQty })
          }}
        >
          <Ionicons name='add-circle' size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {isSmallDevice ? (
        <TouchableOpacity
          style={styles.priceBadge}
          onPress={() => {
            setTempPrice(String(item.price))
            setPriceModalVisible(true)
          }}
        >
          <Text style={styles.priceBadgeText}>${item.price.toFixed(0)}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.priceWrapper}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.priceInput}
            keyboardType='numeric'
            value={String(item.price)}
            onEndEditing={(e) => {
              const value = Number(e.nativeEvent.text) || 0
              onUpdate({ price: value })
            }}
          />
        </View>
      )}

      <TouchableOpacity onPress={onRemove} style={styles.iconButton}>
        <Ionicons name='trash-outline' size={18} color={theme.destructive} />
      </TouchableOpacity>

      <Modal
        visible={notesModalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setNotesModalVisible(false)}
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
                onPress={() => setNotesModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: theme.disabled }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onUpdate({ notes: tempNotes })
                  setNotesModalVisible(false)
                }}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.textPrimary }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={qtyModalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setQtyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cantidad</Text>
            <Text style={styles.modalSubtitle}>{item.name}</Text>

            <View style={styles.qtyModalControls}>
              <TouchableOpacity
                style={styles.modalButtonAlt}
                onPress={() =>
                  setTempQty(String(Math.max(1, Number(tempQty) - 1)))
                }
              >
                <Ionicons name='remove-circle' size={40} color={theme.textPrimary} />
              </TouchableOpacity>

              <TextInput
                style={styles.qtyModalInput}
                keyboardType='numeric'
                value={tempQty}
                onChangeText={setTempQty}
                autoFocus
              />

              <TouchableOpacity
                style={styles.modalButtonAlt}
                onPress={() => setTempQty(String(Number(tempQty) + 1))}
              >
                <Ionicons name='add-circle' size={40} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setQtyModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: theme.disabled }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const newQty = Number(tempQty) || 1
                  onUpdate({ quantity: newQty, price: item.base_price * newQty })
                  setQtyModalVisible(false)
                }}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.textPrimary }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={priceModalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Precio</Text>
            <Text style={styles.modalSubtitle}>{item.name}</Text>

            <View style={styles.priceModalInputWrapper}>
              <Text style={styles.priceModalCurrency}>$</Text>
              <TextInput
                style={styles.priceModalInput}
                keyboardType='numeric'
                value={tempPrice}
                onChangeText={setTempPrice}
                autoFocus
              />
            </View>

            <View style={styles.priceModalButtons}>
              <TouchableOpacity
                onPress={() => setPriceModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: theme.disabled }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const newPrice = Number(tempPrice) || 0
                  const unitPrice =
                    item.quantity > 0 ? newPrice / item.quantity : newPrice
                  onUpdate({ price: newPrice, base_price: unitPrice })
                  setPriceModalVisible(false)
                }}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.textPrimary }}>Guardar</Text>
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
    borderBottomColor: theme.borderLight,
    gap: 6
  },
  iconButton: {
    padding: 4
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary
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
    color: theme.textSecondary
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 13,
    backgroundColor: theme.surface,
    textAlign: 'right'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: theme.background,
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: theme.surface
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
  },
  modalButtonAlt: {
    padding: 8
  },
  qtyModalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16
  },
  qtyModalInput: {
    width: 80,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: theme.surface
  },
  priceBadge: {
    width: 46,
    backgroundColor: theme.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'flex-end'
  },
  priceBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'right'
  },
  priceModalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16
  },
  priceModalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  priceModalCurrency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textSecondary,
    marginRight: 4
  },
  priceModalInput: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 0
  },
  priceModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12
  }
})
