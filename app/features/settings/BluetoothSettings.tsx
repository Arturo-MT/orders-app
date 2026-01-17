import React from 'react'
import { View, Text, StyleSheet, ToastAndroid } from 'react-native'
import PrinterSelector from '../printing/PrinterSelector'
import {
  useInvalidateStore,
  useStoreQuery,
  useStoreUpdateMutation
} from '@/hooks/api/store'

export default function BluetoothSettings() {
  const { data: storeData, isLoading: isLoadingStoreConfig } = useStoreQuery()

  const invalidate = useInvalidateStore()

  const { mutate: saveStoreConfig } = useStoreUpdateMutation({
    onSuccess: () => {
      invalidate()
      ToastAndroid.show(
        'Configuración guardada correctamente',
        ToastAndroid.SHORT
      )
    },
    onError: () => {
      ToastAndroid.show('Error al guardar la configuración', ToastAndroid.SHORT)
    }
  })

  const handleSelectPrinter = (device: { name: string; address: string }) => {
    saveStoreConfig({
      printer_name: device.name,
      printer_address: device.address
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth</Text>

      <Text style={styles.subtitle}>
        {isLoadingStoreConfig
          ? 'Cargando configuración...'
          : `Impresora actual: ${storeData?.printer_name || 'No configurada'}`}
      </Text>

      <View style={styles.selectorWrapper}>
        <PrinterSelector onSelect={handleSelectPrinter} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#130918'
  },
  subtitle: {
    fontSize: 14,
    color: '#130918'
  },
  selectorWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 150
  }
})
