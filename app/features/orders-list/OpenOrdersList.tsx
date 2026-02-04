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
          data={data?.orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} variant='open' />}
        />
      ) : (
        <Text>No hay ordenes abiertas</Text>
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
  }
})
