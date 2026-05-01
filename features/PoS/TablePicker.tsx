import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTablesQuery } from '@/hooks/api/tables'
import { Picker } from '@react-native-picker/picker'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'

type Table = {
  id: string
  name: string
}

interface Props {
  value: string | null
  onChange: (table: Table) => void
}

export default function TablePicker({ value, onChange }: Props) {
  const { data: tables, isLoading } = useTablesQuery()
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const handleChange = (tableId: string | null) => {
    if (!tableId) return
    const table = tables?.find((t) => t.id === tableId)
    if (!table) return
    onChange({ id: table.id, name: table.name })
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerWrapper}>
        <Picker
          mode='dropdown'
          selectedValue={value}
          enabled={!isLoading}
          onValueChange={handleChange}
          style={{ color: theme.textPrimary }}
          dropdownIconColor={theme.textSecondary}
        >
          <Picker.Item
            label='Selecciona una mesa'
            value={null}
            color={theme.textPrimary}
            style={{ backgroundColor: theme.surface }}
          />
          {tables?.map((table) => (
            <Picker.Item
              key={table.id}
              label={table.is_occupied ? `${table.name} (ocupada)` : table.name}
              value={table.id}
              color={theme.textPrimary}
              style={{ backgroundColor: theme.surface }}
            />
          ))}
        </Picker>
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 0
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      height: 46,
      justifyContent: 'center'
    }
  })
