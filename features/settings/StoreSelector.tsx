import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useStore } from '@/context/StoreContext'
import { useTheme } from '@/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export default function StoreSelector() {
  const { stores, activeStore, setActiveStore, loading } = useStore()
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  if (loading || stores.length <= 1) return null

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={activeStore?.id ?? null}
          onValueChange={(storeId) => {
            const selected = stores.find((s) => s.id === storeId)
            if (selected) setActiveStore(selected)
          }}
          mode='dropdown'
          dropdownIconColor={theme.textSecondary}
          style={{ color: theme.textPrimary }}
        >
          {stores.map((store) => (
            <Picker.Item
              key={store.id}
              label={store.name}
              value={store.id}
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
      marginBottom: 8
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: theme.surface
    }
  })
