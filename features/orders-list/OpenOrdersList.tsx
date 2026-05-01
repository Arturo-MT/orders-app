import { useOpenOrderIdsQuery } from '@/hooks/api/orders'
import { useFocusEffect } from 'expo-router'
import React, { memo, useCallback, useEffect, useReducer } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import OrderCard from './OrderCard'
import Skeleton from '@/components/Skeleton'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { clearAllOrderStates } from './orderStates'

type OrderSummary = {
  id: string
  order_number: string
  type: 'DINE_IN' | 'TAKEAWAY'
  status: 'OPEN' | 'PREPARING' | 'DISPATCHED'
  payment_status: string | null
  customer_name: string | null
  table_name: string | null
  table_id: string | null
  dining_table?: { id: string; name: string }
  created_at: string
  opened_at?: string | null
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
  return <OrderCard order={order} onRemove={() => onRemove(order.id)} />
})

export default function OpenOrdersList() {
  const { data: orderIds, isLoading, isRefetching, refetch } = useOpenOrderIdsQuery()

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))
  const [orders, dispatch] = useReducer(orderListReducer, [])
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  React.useEffect(() => {
    if (orderIds) dispatch({ type: 'SET', orders: orderIds as OrderSummary[] })
  }, [orderIds])

  useEffect(() => {
    if (!isLoading && !isRefetching && orders.length === 0) {
      clearAllOrderStates()
    }
  }, [orders.length, isLoading, isRefetching])

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
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }))
      .map(([tableName, ordersList]) => ({
        tableName,
        orders: ordersList.sort((a, b) => Number(a.order_number) - Number(b.order_number))
      }))
  }, [orders])

  const isLoadingTotal = isLoading || isRefetching

  return (
    <View>
      <Text style={styles.title}>ÓRDENES ABIERTAS</Text>

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
              {item.tableName === 'BAR' ? 'BARRA' : item.tableName.toUpperCase()}
            </Text>
            <Text style={styles.count}>{item.orders.length}</Text>
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
    title: { fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 1, marginBottom: 12 },
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      paddingHorizontal: 2
    },
    tableTitle: { fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.5 },
    count: { fontSize: 11, color: theme.textMuted },
    empty: { textAlign: 'center', marginTop: 16, color: theme.textSecondary }
  })
