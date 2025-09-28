import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { View } from 'react-native'

interface CardProps {
  data: Record<string, any>
  onPress?: () => void
  _hiddenFields?: string[]
}

const Card = ({ data, onPress, _hiddenFields = [] }: CardProps) => {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    margin: 8,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    height: 120
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600'
  },
  priceText: {
    fontSize: 14,
    color: '#6200ea',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600'
  },
  badge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  badgeText: {
    fontSize: 12,
    color: '#333',
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
    color: '#333',
    fontWeight: '500',
    textAlign: 'center'
  }
})

export default Card
