import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/Colors'

interface Props {
  value: boolean
  onChange: (newValue: boolean) => void
  disabled?: boolean
}

export default function CustomCheckbox({
  value,
  onChange,
  disabled = false
}: Props) {
  return (
    <TouchableOpacity
      style={!disabled ? styles.container : styles.disabledContainer}
      onPress={() => onChange(!value)}
      disabled={disabled}
    >
      <Ionicons
        name={value ? 'checkbox-outline' : 'square-outline'}
        size={28}
        color={theme.textPrimary}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0
  },
  disabledContainer: {
    padding: 0,
    opacity: 0.4
  }
})
