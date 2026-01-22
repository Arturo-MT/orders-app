import { useFocusEffect } from '@react-navigation/native'
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import OrderCard from './OrderCard'
import { useDebouncedValue } from '@/hooks/utils/useDebouncedValue'
import { Ionicons } from '@expo/vector-icons'
import { useOrdersQuery } from '@/hooks/api/orders'
import OpenOrdersList from './OpenOrdersList'

export default function OrdersListScreen() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 500)

  const {
    data: ordersListData,
    isLoading,
    isFetching,
    refetch
  } = useOrdersQuery({
    page,
    search: debouncedSearch,
    status: 'CLOSED'
  })

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const orders = ordersListData?.orders || []
  const pageSize = 5
  const total = ordersListData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#130918' />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <OpenOrdersList />

      <Text style={styles.sectionTitle}>Historial</Text>

      <TextInput
        placeholder='Buscar por cliente'
        style={styles.input}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => {
          setPage(1)
          refetch()
        }}
      />

      {isFetching ? (
        <>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.orderSkeleton}>
              <View style={styles.skeletonRow}>
                <View style={[styles.skeleton, { width: '50%' }]} />
                <View style={[styles.skeleton, { width: 24, height: 24 }]} />
              </View>
              <View style={styles.skeleton} />
              <View style={[styles.skeleton, { width: '30%' }]} />
            </View>
          ))}
        </>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          style={[styles.pageButton, page <= 1 && styles.disabledButton]}
        >
          <Ionicons name='chevron-back' size={20} color='#130918' />
        </TouchableOpacity>

        <Text style={styles.pageText}>Página {page}</Text>

        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          style={[
            styles.pageButton,
            page >= totalPages && styles.disabledButton
          ]}
        >
          <Ionicons name='chevron-forward' size={20} color='#130918' />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ece2d0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#130918'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  summary: {
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#130918',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexGrow: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#130918'
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  customer: {
    fontSize: 16,
    fontWeight: '500'
  },
  total: {
    color: '#130918'
  },
  date: {
    fontSize: 12,
    color: '#130918',
    opacity: 0.7
  },
  pageButton: {
    backgroundColor: '#f1aa1c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  pageText: {
    fontSize: 16,
    fontWeight: '500'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 20
  },
  skeleton: {
    height: 16,
    backgroundColor: '#ece2d0',
    borderRadius: 4,
    marginBottom: 8
  },
  orderSkeleton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18
  }
})
