import { PermissionsAndroid, Platform } from 'react-native'
import {
  BluetoothEscposPrinter,
  BluetoothManager
} from 'react-native-bluetooth-escpos-printer'
import { logoBase64 } from '@/assets/images/logoBase64'

/* =========================
   TIPOS EXCLUSIVOS DE PRINT
   ========================= */

export type PrintOrder = {
  order_number: string
  type: 'DINE_IN' | 'TAKEAWAY'
  customer_name: string | null
  table_name?: string | null
  is_paid: boolean
  items: {
    name: string
    quantity: number
    price: number
    notes?: string
  }[]
}

/* =========================
   CONFIGURACIÓN IMPRESORA
   ========================= */

const fontConfig = {
  widthtimes: 1,
  heigthtimes: 1,
  fonttype: 1
}

/* =========================
   PERMISOS BLUETOOTH
   ========================= */

export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ])

    return Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    )
  } catch (error) {
    console.error('Error solicitando permisos Bluetooth:', error)
    return false
  }
}

/* =========================
   HELPERS
   ========================= */

const normalizeTextForPrinter = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')

/* =========================
   FUNCIÓN PRINCIPAL
   ========================= */

const CONNECT_TIMEOUT_MS = 10_000

const connectWithTimeout = (address: string): Promise<void> =>
  Promise.race([
    BluetoothManager.connect(address) as Promise<void>,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Tiempo de conexión agotado (10s)')),
        CONNECT_TIMEOUT_MS
      )
    )
  ])

const executePrint = async (order: PrintOrder): Promise<void> => {
  /* ---------- LOGO ---------- */
  await BluetoothEscposPrinter.printPic(logoBase64, {
    width: 576,
    left: 80
  })
  // Esperar a que la impresora termine de renderizar el bitmap antes de enviar más comandos
  await new Promise<void>((resolve) => setTimeout(resolve, 300))

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT)

  /* ---------- ENCABEZADO ---------- */
  const headerLines: string[] = []

  headerLines.push(`Comanda: ${order.order_number}`)

  if (order.table_name) {
    headerLines.push(`Mesa: ${order.table_name ?? '-'}`)
  }

  if (order.customer_name) {
    headerLines.push(`Cliente: ${order.customer_name}`)
  }

  headerLines.push(`Estado: ${order.is_paid ? 'Pagada' : 'Pendiente'}`)

  headerLines.push(
    `Tipo: ${order.type === 'DINE_IN' ? 'Para aqui' : 'Para llevar'}`
  )

  await BluetoothEscposPrinter.printText(
    headerLines.join('\n') + '\n\n',
    fontConfig
  )

  await BluetoothEscposPrinter.printText(
    '-----------------------------------------------\n',
    {}
  )

  /* ---------- TABLA ---------- */
  const columnWidths = [18, 6, 8]

  await BluetoothEscposPrinter.printColumn(
    columnWidths,
    [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.CENTER,
      BluetoothEscposPrinter.ALIGN.RIGHT
    ],
    ['Producto', 'Cant', 'Precio'],
    fontConfig
  )

  await BluetoothEscposPrinter.printText(
    '-----------------------------------------------\n',
    {}
  )

  /* ---------- ITEMS ---------- */
  for (const item of order.items) {
    const name = normalizeTextForPrinter(item.name)
    const quantity = item.quantity.toString()
    const price = (item.price * item.quantity).toFixed(2)

    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT
      ],
      [name, quantity, price],
      fontConfig
    )

    if (item.notes?.trim()) {
      await BluetoothEscposPrinter.printText(
        `  - ${normalizeTextForPrinter(item.notes)}\n`,
        fontConfig
      )
    }
  }

  await BluetoothEscposPrinter.printText(
    '-----------------------------------------------\n',
    {}
  )

  /* ---------- TOTAL ---------- */
  const total = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT)

  await BluetoothEscposPrinter.printText(
    `Total: ${total.toFixed(2)}\n\n`,
    fontConfig
  )

  await BluetoothEscposPrinter.printText('\n\n\n', {})
  await BluetoothEscposPrinter.cutOnePoint()
}

export const printOrder = async (
  order: PrintOrder,
  printerAddress?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!printerAddress) {
    return { success: false, error: 'No hay impresora configurada' }
  }

  const hasPermission = await requestBluetoothPermissions()
  if (!hasPermission) {
    return {
      success: false,
      error: 'Permisos de Bluetooth no concedidos'
    }
  }

  const attempt = async (): Promise<void> => {
    await connectWithTimeout(printerAddress)
    await executePrint(order)
    try {
      await BluetoothManager.disconnect(printerAddress)
    } catch {
      /* ignorar */
    }
  }

  try {
    await attempt()
    return { success: true }
  } catch (firstError: any) {
    console.warn(
      'Primer intento de impresión fallido, reintentando...',
      firstError?.message
    )
    try {
      await BluetoothManager.disconnect(printerAddress)
    } catch {
      /* ignorar */
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 800))

    try {
      await attempt()
      return { success: true }
    } catch (secondError: any) {
      console.error('Segundo intento de impresión fallido:', secondError)
      return {
        success: false,
        error: secondError?.message || 'Error desconocido al imprimir'
      }
    }
  }
}
