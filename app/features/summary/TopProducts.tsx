import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/Colors'

type TopProduct = {
  product_name: string
  total_quantity: number
  total_revenue: number
}

interface Props {
  products: TopProduct[]
}

export default function TopProductsCard({ products }: Props) {
  if (!products.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Top productos</Text>
        <Text style={styles.empty}>Sin ventas en este periodo</Text>
      </View>
    )
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return ' '
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top productos</Text>

      {products.map((p, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.rank}>{getRankIcon(i)}</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {p.product_name}
            </Text>
          </View>

          <Text style={styles.quantity}>x{p.total_quantity}</Text>

          <Text style={styles.total}>${p.total_revenue.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6
  },
  rank: {
    width: 22,
    textAlign: 'center',
    fontSize: 16
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    flexShrink: 1
  },
  quantity: {
    width: 50,
    textAlign: 'center',
    color: theme.textSecondary,
    fontWeight: '500'
  },
  total: {
    width: 80,
    textAlign: 'right',
    fontWeight: '600',
    color: theme.textPrimary
  },
  empty: {
    color: theme.textMuted,
    fontStyle: 'italic'
  }
})
