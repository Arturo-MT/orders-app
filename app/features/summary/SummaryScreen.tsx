import React, { useState } from 'react'
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

type Period = 'day' | 'week' | 'month' | 'year'

export default function SummaryScreen() {
  const [period, setPeriod] = useState<Period>('year')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const [queryParams, setQueryParams] = useState<{
    period: Period
    date: string
  } | null>(null)

  const { data, isLoading, isError, error } = useSummaryQuery(queryParams)

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
          <>
            <Text style={styles.resultText}>
              Total de órdenes: {data.summary.total_orders}
            </Text>
            <Text style={styles.resultText}>
              Total vendido: ${data.summary.total_revenue}
            </Text>
          </>
        )}

        {!isLoading && !data && (
          <Text style={styles.placeholderText}>
            Selecciona filtros y presiona Consultar
          </Text>
        )}
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
  }
})
