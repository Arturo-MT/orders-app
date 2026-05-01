import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OrderItemDraft } from '@/types/types'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { spacing, typography } from '@/theme/tokens'

export type EditField = 'qty' | 'price' | 'notes'

interface Props {
  item: OrderItemDraft
  onUpdate: (updates: Partial<OrderItemDraft>) => void
  onRemove: () => void
  onEditField: (field: EditField) => void
}

export default function OrderItemComponent({ item, onUpdate, onRemove, onEditField }: Props) {
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const hasNotes = !!item.notes?.trim()

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            disabled={item.quantity <= 1}
            onPress={() => onUpdate({ quantity: item.quantity - 1 })}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name='remove-circle'
              size={22}
              color={item.quantity <= 1 ? theme.disabled : theme.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEditField('qty')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.qtyText}>{item.quantity}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onUpdate({ quantity: item.quantity + 1 })}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name='add-circle' size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => onEditField('price')}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          style={styles.priceButton}
        >
          <Text style={styles.priceText}>${item.price}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons name='trash-outline' size={20} color={theme.destructive} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => onEditField('notes')}>
        <Text
          style={[styles.notesText, !hasNotes && styles.notesPlaceholder]}
          numberOfLines={2}
        >
          {hasNotes ? item.notes : 'Sin especificaciones'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      gap: spacing.xs,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconButton: { padding: spacing.xs },
    name: {
      flex: 1,
      ...typography.body,
      fontWeight: '500',
      color: theme.textPrimary,
      flexShrink: 1,
      minWidth: 0,
    },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    qtyText: {
      minWidth: 32,
      textAlign: 'center',
      ...typography.body,
      fontWeight: '600',
      color: theme.textPrimary,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    priceButton: { paddingVertical: 2, paddingHorizontal: spacing.xs },
    priceText: {
      ...typography.bodySm,
      color: theme.textPrimary,
      fontWeight: '500',
      minWidth: 48,
      textAlign: 'right',
    },
    notesText: {
      fontSize: 12,
      color: theme.textSecondary,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    notesPlaceholder: {
      color: theme.textMuted,
      fontStyle: 'italic',
    },
  })
