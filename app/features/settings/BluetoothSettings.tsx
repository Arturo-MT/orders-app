import React from 'react'
import PrinterSelector from '../printing/PrinterSelector'
import { savePrinter } from '../printing/print'
import { ToastAndroid } from 'react-native'

export default function BluetoothSettings() {
  const handleSelectPrinter = async (device: { address: string }) => {
    await savePrinter(device.address)
    ToastAndroid.show(
      'Impresora seleccionada correctamente',
      ToastAndroid.SHORT
    )
  }

  return <PrinterSelector onSelect={handleSelectPrinter} />
}
