import { useScheduledOrderIdsQuery } from '@/hooks/api/orders'
import { useFocusEffect } from 'expo-router'
import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import OrderCard from './OrderCard'
import Skeleton from '@/components/Skeleton'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export default function ScheduledOrdersList() {
  const { data: orders, isLoading, isRefetching, refetch } = useScheduledOrderIdsQuery()

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const isLoadingTotal = isLoading || isRefetching
  const hasOrders = (orders?.length ?? 0) > 0

  if (!isLoadingTotal && !hasOrders) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ÓRDENES PROGRAMADAS</Text>

      {isLoadingTotal && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width='100%' height={56} radius={12} />
          ))}
        </View>
      )}

      {!isLoadingTotal && orders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { marginBottom: 8 },
    title: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textMuted,
      letterSpacing: 1,
      marginBottom: 12
    }
  })
