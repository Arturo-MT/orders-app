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
import ScheduledOrdersList from './ScheduledOrdersList'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export default function OrdersListScreen() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 500)
  const { theme } = useTheme()
  const styles = makeStyles(theme)

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

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const orders = ordersListData?.orders || []
  const pageSize = 5
  const total = ordersListData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color={theme.textPrimary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListHeaderComponent={
          <>
            <OpenOrdersList />
            <ScheduledOrdersList />
            <Text style={styles.sectionTitle}>HISTORIAL</Text>
            <View style={styles.searchContainer}>
              <Ionicons
                name='search-outline'
                size={18}
                color={theme.textMuted}
              />
              <TextInput
                placeholder='Buscar por cliente'
                placeholderTextColor={theme.textMuted}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => {
                  setPage(1)
                  refetch()
                }}
              />
            </View>
            {isFetching &&
              [...Array(6)].map((_, i) => (
                <View key={i} style={styles.orderSkeleton}>
                  <View style={styles.skeletonRow}>
                    <View style={[styles.skeleton, { width: '50%' }]} />
                    <View
                      style={[styles.skeleton, { width: 24, height: 24 }]}
                    />
                  </View>
                  <View style={styles.skeleton} />
                  <View style={[styles.skeleton, { width: '30%' }]} />
                </View>
              ))}
          </>
        }
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          style={[styles.pageButton, page <= 1 && styles.disabledButton]}
        >
          <Ionicons name='chevron-back' size={20} color={theme.textOnPrimary} />
        </TouchableOpacity>

        <Text style={styles.pageText}>
          Página {page} de {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          style={[
            styles.pageButton,
            page >= totalPages && styles.disabledButton
          ]}
        >
          <Ionicons
            name='chevron-forward'
            size={20}
            color={theme.textOnPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, paddingTop: 16 },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 16,
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      gap: 8
    },
    searchInput: { flex: 1, color: theme.textPrimary },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textMuted,
      letterSpacing: 1,
      marginBottom: 12,
      marginHorizontal: 16
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background
    },
    pageButton: {
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 8,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center'
    },
    disabledButton: { backgroundColor: theme.disabled },
    pageText: { fontSize: 16, fontWeight: '500', color: theme.textPrimary },
    skeleton: {
      height: 16,
      backgroundColor: theme.borderLight,
      borderRadius: 4,
      marginBottom: 8
    },
    orderSkeleton: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      marginHorizontal: 16
    },
    skeletonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  })
