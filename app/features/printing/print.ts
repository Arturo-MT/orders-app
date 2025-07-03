import { PermissionsAndroid, Platform } from 'react-native'
import EncryptedStorage from 'react-native-encrypted-storage'
import {
  BluetoothEscposPrinter,
  BluetoothManager
} from 'react-native-bluetooth-escpos-printer'
import { logoBase64 } from '@/assets/images/logoBase64'
import { Order } from '@/types/types'

const PRINTER_KEY = 'selected_printer'
const fontConfig = {
  widthtimes: 1,
  heigthtimes: 1,
  fonttype: 1
}

export const savePrinter = async (address: string) => {
  try {
    await EncryptedStorage.setItem(PRINTER_KEY, address)
  } catch (error) {
    console.error('Error guardando impresora:', error)
  }
}

export const getSavedPrinter = async (): Promise<string | null> => {
  try {
    return await EncryptedStorage.getItem(PRINTER_KEY)
  } catch (error) {
    console.error('Error obteniendo impresora guardada:', error)
    return null
  }
}

export const clearSavedPrinter = async () => {
  try {
    await EncryptedStorage.removeItem(PRINTER_KEY)
  } catch (error) {
    console.error('Error eliminando impresora guardada:', error)
  }
}

export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ])

    const allGranted = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    )

    if (!allGranted) {
      console.warn('Permisos de Bluetooth no concedidos')
    }

    return allGranted
  } catch (error) {
    console.error('Error solicitando permisos Bluetooth:', error)
    return false
  }
}

export const scanDevices = async () => {
  const hasPermission = await requestBluetoothPermissions()
  if (!hasPermission) return

  const devices = await BluetoothManager.scanDevices()
  const paired =
    typeof devices.paired === 'string'
      ? JSON.parse(devices.paired)
      : devices.paired

  console.log('Dispositivos emparejados:', paired)
}

export const connectToPrinter = async (address: string): Promise<void> => {
  const hasPermission = await requestBluetoothPermissions()
  if (!hasPermission) return

  try {
    await BluetoothManager.connect(address)
    console.log('Conectado a la impresora')
  } catch (error) {
    console.error('Error al conectar a la impresora:', error)
  }
}

const normalizeTextForPrinter = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
}

export const printOrder = async (order: Order): Promise<boolean> => {
  const hasPermission = await requestBluetoothPermissions()
  if (!hasPermission) return false

  const savedAddress = await getSavedPrinter()
  if (!savedAddress) {
    console.warn('No hay impresora guardada.')
    return false
  }

  try {
    await BluetoothManager.connect(savedAddress)

    const normalizedName = normalizeTextForPrinter(order.customer_name)

    await BluetoothEscposPrinter.printPic(logoBase64, {
      width: 576,
      left: 80
    })

    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT)

    await BluetoothEscposPrinter.printText(
      `Nombre: ${normalizedName}\nComanda: ${order.order_number}\nTipo: ${
        order.type === 'F' ? 'Para aqui' : 'Para llevar'
      }\n\n`,
      fontConfig
    )
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER
    )
    await BluetoothEscposPrinter.printText('-------------------------\n\n', {})
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT)

    for (const item of order.items) {
      const normalizedName = normalizeTextForPrinter(item.name)
      const line = `${item.quantity}x ${normalizedName}\n`
      await BluetoothEscposPrinter.printText(line, fontConfig)

      if (item.description && item.description.trim() !== '') {
        const commentLine = ` - ${item.description.trim()}\n`
        await BluetoothEscposPrinter.printText(commentLine, fontConfig)
      }

      await BluetoothEscposPrinter.printText('\n', {})
    }
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER
    )
    await BluetoothEscposPrinter.printText(
      '-------------------------\n\n\n\n\n\n',
      {}
    )
    await BluetoothEscposPrinter.cutOnePoint()
    return true
  } catch (error) {
    console.error('Error al imprimir comanda:', error)
    await clearSavedPrinter()
    return false
  }
}
