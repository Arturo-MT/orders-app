import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { useSummaryQuery } from '@/hooks/api/summary'
import TopProductsCard from './TopProducts'
import { useFocusEffect } from 'expo-router'

type Period = 'day' | 'week' | 'month' | 'year'

export default function SummaryScreen() {
  const today = new Date()

  const [period, setPeriod] = useState<Period>('year')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const formatDateForApi = (date: Date, period: Period) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    switch (period) {
      case 'day':
        return `${yyyy}-${mm}-${dd}`
      case 'week':
        return `${yyyy}-${mm}-${dd}`
      case 'month':
        return `${yyyy}-${mm}`
      case 'year':
        return `${yyyy}`
    }
  }

  const [queryParams, setQueryParams] = useState({
    period: 'day' as Period,
    date: formatDateForApi(today, 'day')
  })

  const { data, isLoading, isError, error, refetch } =
    useSummaryQuery(queryParams)

  useEffect(() => {
    setPeriod('day')
    setSelectedDate(today)
  }, [])

  useFocusEffect(() => {
    refetch()
  })

  const totalOrders = data?.summary?.total_orders ?? 0
  const totalRevenue = data?.summary?.total_revenue ?? 0

  const avgTicket =
    totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : '0'

  const handleConsult = () => {
    setQueryParams({
      period,
      date: formatDateForApi(selectedDate, period)
    })
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.periodRow}>
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                period === p && styles.periodButtonActive
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodText,
                  period === p && styles.periodTextActive
                ]}
              >
                {p === 'day'
                  ? 'Día'
                  : p === 'week'
                    ? 'Semana'
                    : p === 'month'
                      ? 'Mes'
                      : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name='calendar' size={20} color='#130918' />
          <Text style={styles.dateText}>
            {formatDateForApi(selectedDate, period)}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              if (Platform.OS === 'android') {
                setShowPicker(false)
              }
              if (date) setSelectedDate(date)
            }}
          />
        )}

        {Platform.OS === 'ios' && showPicker && (
          <Button title='Listo' onPress={() => setShowPicker(false)} />
        )}

        <TouchableOpacity style={styles.consultButton} onPress={handleConsult}>
          <Ionicons name='search' size={20} color='#130918' />
          <Text style={styles.consultText}>Consultar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {isLoading && <ActivityIndicator size='large' />}

        {isError && (
          <Text style={styles.errorText}>
            Error: {(error as Error).message}
          </Text>
        )}

        {!isLoading && data?.summary && (
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, styles.kpiPrimary]}>
              <Text style={styles.kpiValue}>${data.summary.total_revenue}</Text>
              <Text style={styles.kpiLabel}>Total vendido</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.summary.total_orders}</Text>
              <Text style={styles.kpiLabel}>Órdenes</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>${avgTicket}</Text>
              <Text style={styles.kpiLabel}>Ticket promedio</Text>
            </View>
          </View>
        )}

        {!isLoading && data?.summary?.total_orders === 0 && (
          <Text style={styles.placeholderText}>
            No hay ventas en este periodo
          </Text>
        )}

        <TopProductsCard products={data?.summary?.top_products ?? []} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ece2d0'
  },
  card: {
    borderRadius: 5,
    padding: 12,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#ece2d0'
  },
  periodButtonActive: {
    backgroundColor: '#f1aa1c'
  },
  periodText: {
    color: '#130918',
    fontWeight: 'bold'
  },
  periodTextActive: {
    color: '#130918'
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10
  },
  dateText: {
    fontWeight: 'bold'
  },
  consultButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1aa1c',
    borderRadius: 5,
    paddingVertical: 8
  },
  consultText: {
    color: '#130918',
    fontWeight: 'bold'
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6
  },
  placeholderText: {
    color: '#777'
  },
  errorText: {
    color: '#e53935'
  },
  resultText: {
    fontSize: 24,
    marginBottom: 4
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  kpiPrimary: {
    backgroundColor: '#f1aa1c'
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#130918'
  },
  kpiLabel: {
    fontSize: 12,
    color: '#333'
  }
})
