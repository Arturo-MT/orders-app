import { useOrdersQuery } from '@/hooks/api/orders'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import OrderCard from './OrderCard'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function OpenOrdersList() {
  const { data: openOrdersData, refetch: refetchOpenOrders } = useOrdersQuery({
    page: 1,
    pageSize: 100,
    status: 'OPEN'
  })

  const { data: unpaidOrdersData, refetch: refetchUnpaidOrders } =
    useOrdersQuery({
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

      {data && data?.orders?.length > 0 ? (
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
