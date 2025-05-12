import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  value: boolean
  onChange: (newValue: boolean) => void
}

export default function CustomCheckbox({ value, onChange }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onChange(!value)}>
      <Ionicons
        name={value ? 'checkbox-outline' : 'square-outline'}
        size={28}
        color={value ? '#6200ea' : '#aaa'}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0
  }
})
