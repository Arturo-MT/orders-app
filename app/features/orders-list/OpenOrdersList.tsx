import { useOpenOrderIds } from '@/hooks/api/orders'
import React, { memo, useCallback, useReducer } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import OrderCard from './OrderCard'
import { Ionicons } from '@expo/vector-icons'
import Skeleton from '@/app/components/Skeleton'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

type OrderSummary = {
  id: string
  order_number: string
  type: 'DINE_IN' | 'TAKEAWAY'
  status: 'OPEN' | 'UNPAID'
  customer_name: string | null
  table_name: string | null
  table_id: string | null
  dining_table?: { id: string; name: string }
  created_at: string
}

const orderListReducer = (
  state: OrderSummary[],
  action: { type: 'SET'; orders: OrderSummary[] } | { type: 'REMOVE'; id: string }
) => {
  switch (action.type) {
    case 'SET': return action.orders
    case 'REMOVE': return state.filter((o) => o.id !== action.id)
    default: return state
  }
}

const OrderCardWrapper = memo(function OrderCardWrapper({
  order,
  onRemove
}: {
  order: OrderSummary
  onRemove: (id: string) => void
}) {
  return <OrderCard order={order} variant='open' onRemove={() => onRemove(order.id)} />
})

export default function OpenOrdersList() {
  const { data: orderIds, isLoading, refetch, isRefetching } = useOpenOrderIds()
  const [orders, dispatch] = useReducer(orderListReducer, [])
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  React.useEffect(() => {
    if (orderIds) dispatch({ type: 'SET', orders: orderIds as OrderSummary[] })
  }, [orderIds])

  const handleRemove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  const groupedOrders = React.useMemo(() => {
    if (!orders || orders.length === 0) return []
    const map: Record<string, OrderSummary[]> = {}
    orders.forEach((order) => {
      const key = order.dining_table?.name ?? order.customer_name ?? 'Barra'
      if (!map[key]) map[key] = []
      map[key].push(order)
    })
    return Object.entries(map).map(([tableName, ordersList]) => ({ tableName, orders: ordersList }))
  }, [orders])

  const isLoadingTotal = isLoading || isRefetching

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Órdenes abiertas</Text>
        <Pressable onPress={() => refetch()}>
          <Ionicons name='refresh' size={24} color={theme.textPrimary} />
        </Pressable>
      </View>

      {isLoadingTotal && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width='100%' height={56} radius={12} />
          ))}
        </View>
      )}

      {!isLoadingTotal && orders.length > 0 && groupedOrders.map((item) => (
        <View key={item.tableName} style={{ marginBottom: 16 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>
              {item.tableName === 'BAR' ? 'Barra' : item.tableName}
            </Text>
            <Text style={styles.count}>{item.orders.length} orden(es)</Text>
          </View>
          {item.orders.map((order) => (
            <OrderCardWrapper key={order.id} order={order} onRemove={handleRemove} />
          ))}
        </View>
      ))}

      {!isLoadingTotal && orders.length === 0 && (
        <Text style={styles.empty}>No hay órdenes abiertas</Text>
      )}
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    title: { textAlign: 'center', marginBottom: 8, fontSize: 18, color: theme.textPrimary },
    titleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.borderLight,
      padding: 8,
      borderRadius: 8,
      marginBottom: 6
    },
    tableTitle: { fontWeight: '600', fontSize: 15, color: theme.textPrimary },
    count: { fontSize: 12, color: theme.textSecondary },
    empty: { textAlign: 'center', marginTop: 16, color: theme.textSecondary }
  })
