import { useOrdersQuery } from '@/hooks/api/orders'
import React from 'react'
import { FlatList, StyleSheet, Text } from 'react-native'
import OrderCard from './OrderCard'
import { View } from 'react-native'

export default function OpenOrdersList() {
  const { data: openOrdersData } = useOrdersQuery({
    page: 1,
    status: 'OPEN'
  })

  const { data: unpaidOrdersData } = useOrdersQuery({
    page: 1,
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
      <Text style={styles.title}>Órdenes abiertas</Text>

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
  }
})
