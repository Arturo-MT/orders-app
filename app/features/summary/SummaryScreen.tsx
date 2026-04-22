import React, { useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { useSummaryQuery } from '@/hooks/api/summary'
import TopProductsCard from './TopProducts'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

type Period = 'day' | 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
  year: 'Año'
}

function formatDateForApi(date: Date, period: Period): string {
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

export default function SummaryScreen() {
  const [period, setPeriod] = useState<Period>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const { data, isLoading, isError, error } = useSummaryQuery({
    period,
    date: formatDateForApi(selectedDate, period)
  })

  const totalOrders = data?.summary?.total_orders ?? 0
  const totalRevenue = data?.summary?.total_revenue ?? 0
  const avgTicket =
    totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : '0'

  return (
    <View style={styles.wrapper}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.periodRow}>
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
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
                  {PERIOD_LABELS[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name='calendar' size={20} color={theme.textPrimary} />
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
                if (Platform.OS === 'android') setShowPicker(false)
                if (date) setSelectedDate(date)
              }}
            />
          )}
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
                <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
                  ${Number(totalRevenue).toLocaleString()}
                </Text>
                <Text style={styles.kpiLabel} numberOfLines={2}>Total vendido</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{totalOrders}</Text>
                <Text style={styles.kpiLabel} numberOfLines={2}>Órdenes</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>${avgTicket}</Text>
                <Text style={styles.kpiLabel} numberOfLines={2}>Ticket promedio</Text>
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
      </ScrollView>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: theme.background },
    scrollContent: { padding: 10, paddingBottom: 24 },
    card: { borderRadius: 5, padding: 12, marginBottom: 10 },
    periodRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    periodButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: theme.surface
    },
    periodButtonActive: { backgroundColor: theme.primary },
    periodText: { color: theme.textSecondary, fontWeight: 'bold' },
    periodTextActive: { color: theme.textOnPrimary },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: 5
    },
    dateText: { fontWeight: 'bold', color: theme.textPrimary },
    placeholderText: { color: theme.textMuted },
    errorText: { color: theme.destructive },
    kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    kpiCard: {
      flex: 1,
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center'
    },
    kpiPrimary: { backgroundColor: theme.primary },
    kpiValue: { fontSize: 26, fontWeight: 'bold', color: theme.textOnPrimary },
    kpiLabel: { fontSize: 12, color: theme.textOnPrimary }
  })
