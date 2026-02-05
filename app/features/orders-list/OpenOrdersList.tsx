import { useOrdersQuery } from '@/hooks/api/orders'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import OrderCard from './OrderCard'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Skeleton from '@/app/components/Skeleton'

export default function OpenOrdersList() {
  const {
    data: openOrdersData,
    refetch: refetchOpenOrders,
    isRefetching: isRefetchingOpenOrders,
    isLoading: isLoadingOpenOrders
  } = useOrdersQuery({
    page: 1,
    pageSize: 100,
    status: 'OPEN'
  })

  const {
    data: unpaidOrdersData,
    refetch: refetchUnpaidOrders,
    isRefetching: isRefetchingUnpaidOrders,
    isLoading: isLoadingUnpaidOrders
  } = useOrdersQuery({
    page: 1,
    pageSize: 100,
    status: 'UNPAID'
  })

  const data = {
    orders: [
      ...(openOrdersData?.orders || []),
      ...(unpaidOrdersData?.orders || [])
    ]
  }

  const isLoading =
    isLoadingOpenOrders ||
    isLoadingUnpaidOrders ||
    isRefetchingOpenOrders ||
    isRefetchingUnpaidOrders

  const groupedOrders = React.useMemo(() => {
    if (!data?.orders) return []

    const map: Record<string, any[]> = {}

    data.orders.forEach((order) => {
      const key = order.dining_table?.name ?? order.customer_name ?? 'Barra'

      if (!map[key]) {
        map[key] = []
      }

      map[key].push(order)
    })

    return Object.entries(map).map(([tableName, orders]) => ({
      tableName,
      orders
    }))
  }, [data?.orders])

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Órdenes abiertas</Text>
        <Pressable
          onPress={() => {
            refetchOpenOrders()
            refetchUnpaidOrders()
          }}
        >
          <Ionicons name='refresh' size={24} color='#130918' />
        </Pressable>
      </View>

      {isLoading && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width='100%' height={56} radius={12} />
          ))}
        </View>
      )}

      {!isLoading && data && data?.orders?.length > 0 ? (
        <FlatList
          data={groupedOrders}
          keyExtractor={(item) => item.tableName}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>
                  {item.tableName === 'BAR' ? 'Barra' : item.tableName}
                </Text>

                <Text style={styles.count}>{item.orders.length} orden(es)</Text>
              </View>

              {item.orders.map((order) => (
                <OrderCard key={order.id} order={order} variant='open' />
              ))}
            </View>
          )}
        />
      ) : null}

      {!isLoading && data && data?.orders?.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 16 }}>
          No hay órdenes abiertas
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6
  },
  tableTitle: {
    fontWeight: '600',
    fontSize: 15
  },
  count: {
    fontSize: 12,
    color: '#666'
  }
})
