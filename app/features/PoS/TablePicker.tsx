import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useTablesQuery } from '@/hooks/api/tables'

interface Props {
  value: string | null
  onChange: (tableId: string | null) => void
}

export default function TablePicker({ value, onChange }: Props) {
  const { data: tables, isLoading } = useTablesQuery({
    showOnlyActive: true
  })

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerWrapper}>
        <Picker
          mode='dropdown'
          selectedValue={value}
          enabled={!isLoading}
          onValueChange={(val) => onChange(val)}
          style={styles.picker}
        >
          <Picker.Item label='Selecciona una mesa' value={null} />
          {tables?.map((table) => (
            <Picker.Item
              key={table.id}
              label={table.is_occupied ? `${table.name} (ocupada)` : table.name}
              value={table.id}
              enabled={!table.is_occupied}
            />
          ))}
        </Picker>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0
  },

  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#130918'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
    height: 46,
    justifyContent: 'center'
  },
  picker: {
    height: 46,
    width: '100%'
  }
})
