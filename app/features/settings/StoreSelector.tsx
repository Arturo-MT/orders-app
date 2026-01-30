import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useStore } from '@/app/context/StoreContext'

export default function StoreSelector() {
  const { stores, activeStore, setActiveStore, loading } = useStore()

  if (loading || stores.length <= 1) return null

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={activeStore?.id ?? null}
          onValueChange={(storeId) => {
            const selected = stores.find((s) => s.id === storeId)
            if (selected) {
              setActiveStore(selected)
            }
          }}
          mode='dropdown'
        >
          {stores.map((store) => (
            <Picker.Item key={store.id} label={store.name} value={store.id} />
          ))}
        </Picker>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff'
  }
})
