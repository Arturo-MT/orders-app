import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PrinterSelector from '../printing/PrinterSelector'
import {
  useInvalidateStore,
  useStoreQuery,
  useStoreUpdateMutation
} from '@/hooks/api/store'
import { theme } from '@/constants/Colors'
import { useToast } from '@/app/context/ToastContext'

export default function BluetoothSettings() {
  const { data: storeData, isLoading: isLoadingStoreConfig } = useStoreQuery()
  const { showToast } = useToast()
  const invalidate = useInvalidateStore()

  const { mutate: saveStoreConfig } = useStoreUpdateMutation({
    onSuccess: () => {
      invalidate()
      showToast('Configuración guardada correctamente', 'success')
    },
    onError: () => {
      showToast('Error al guardar la configuración', 'error')
    }
  })

  const handleSelectPrinter = (device: { name?: string; address: string }) => {
    if (!device.name) {
      showToast('El nombre de la impresora no es válido', 'error')
      return
    }
    saveStoreConfig({
      printer_name: device.name,
      printer_address: device.address
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        {isLoadingStoreConfig
          ? 'Cargando configuración...'
          : `Impresora actual: ${storeData?.printer_name || 'No configurada'}`}
      </Text>

      <PrinterSelector onSelect={handleSelectPrinter} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary
  }
})
