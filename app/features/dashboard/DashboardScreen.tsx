import { useDashboardQuery } from '@/hooks/api/dashboard'
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

export default function DashboardScreen() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 500)

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    refetch
  } = useDashboardQuery({
    search: debouncedSearch,
    page
  })

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const summary = dashboardData?.results?.summary
  const orders = dashboardData?.results?.orders || []

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#6200ea' />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumen</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hoy</Text>
            {isFetching ? (
              <>
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
              </>
            ) : (
              <>
                <Text>{summary?.today.total_orders} órdenes</Text>
                <Text>${summary?.today.total_revenue}</Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mes</Text>
            {isFetching ? (
              <>
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
              </>
            ) : (
              <>
                <Text>{summary?.month.total_orders} órdenes</Text>
                <Text>${summary?.month.total_revenue}</Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Año</Text>
            {isFetching ? (
              <>
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
              </>
            ) : (
              <>
                <Text>{summary?.year.total_orders} órdenes</Text>
                <Text>${summary?.year.total_revenue}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <TextInput
        placeholder='Buscar por cliente'
        style={styles.input}
        value={search}
        onChangeText={(text) => setSearch(text)}
        onSubmitEditing={() => {
          setPage(1)
          refetch()
        }}
      />

      {isFetching ? (
        <>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={styles.orderSkeleton}>
              <View style={styles.skeletonRow}>
                <View style={[styles.skeleton, { width: '50%', height: 16 }]} />
                <View
                  style={[
                    styles.skeleton,
                    { width: 24, height: 24, borderRadius: 12 }
                  ]}
                />
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
          <Ionicons name='chevron-back' size={20} color='#fff' />
        </TouchableOpacity>

        <Text style={styles.pageText}>Página {page}</Text>

        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={!dashboardData?.next}
          style={[
            styles.pageButton,
            !dashboardData?.next && styles.disabledButton
          ]}
        >
          <Ionicons name='chevron-forward' size={20} color='#fff' />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16
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
    shadowColor: '#000',
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
    color: '#6200ea'
  },
  orderItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  customer: {
    fontSize: 16,
    fontWeight: '500'
  },
  total: {
    color: '#333'
  },
  date: {
    fontSize: 12,
    color: '#888'
  },
  pageButton: {
    backgroundColor: '#6200ea',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8
  },
  orderSkeleton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  }
})
