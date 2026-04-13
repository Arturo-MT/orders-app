import React from 'react'
import { Pressable, Text, StyleSheet, View } from 'react-native'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

interface CardProps {
  data: Record<string, any>
  onPress?: () => void
  _hiddenFields?: string[]
}

const Card = ({ data, onPress, _hiddenFields = [] }: CardProps) => {
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  if (!data || typeof data !== 'object') return null

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      {Object.entries(data)
        .filter(([key]) => !_hiddenFields.includes(key))
        .map(([key, value]) => {
          return (
            <View key={key} style={styles.row}>
              {key === 'category' ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{value}</Text>
                </View>
              ) : (
                <Text
                  style={{
                    ...styles.label,
                    ...(key === 'name' ? styles.nameText : styles.cardText),
                    ...(key === 'price' ? styles.priceText : {})
                  }}
                >
                  {key === 'price' ? `$${value}` : value}
                </Text>
              )}
            </View>
          )
        })}
    </Pressable>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 12,
      shadowColor: theme.textPrimary,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 6,
      width: '100%',
      flex: 1
    },
    cardText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4
    },
    nameText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary
    },
    priceText: {
      fontSize: 14,
      color: theme.textOnPrimary,
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      fontWeight: '700',
      overflow: 'hidden'
    },
    badge: {
      backgroundColor: theme.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 4
    },
    badgeText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    label: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
      textAlign: 'center'
    }
  })

export default Card
