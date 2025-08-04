import React from 'react'
import PrinterSelector from '../printing/PrinterSelector'
import { ToastAndroid, StyleSheet } from 'react-native'
import {
  useInvalidateStore,
  useStoreQuery,
  useStoreUpdateMutation
} from '@/hooks/api/store'
import { Text } from 'react-native'

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
    onError: (error: any) => {
      console.error(
        'Error guardando configuración:',
        error?.response?.data || error
      )
      ToastAndroid.show('Error al guardar la configuración', ToastAndroid.SHORT)
    }
  })

  const handleSelectPrinter = async (device: {
    name: string
    address: string
  }) => {
    const payload = {
      printer_name: device.name,
      printer_address: device.address
    }
    console.log('Guardando configuración de impresora:', payload)
    await saveStoreConfig(payload)
  }

  return (
    <>
      <Text style={styles.title}>Configuración de Bluetooth</Text>
      <Text style={styles.text}>
        {isLoadingStoreConfig
          ? 'Cargando configuración...'
          : `Impresora actual: ${storeData?.printer_name || 'No configurada'}`}
      </Text>
      <PrinterSelector onSelect={handleSelectPrinter} />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    marginBottom: 10
  }
})
