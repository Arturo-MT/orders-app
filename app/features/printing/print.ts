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

const wrapWords = (text: string, maxWidth: number): string[] => {
  const words = text.trim().split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current.length > 0) lines.push(current)
  return lines
}

/* =========================
   FUNCIÓN PRINCIPAL
   ========================= */

const CONNECT_TIMEOUT_MS = 10_000

const connectWithTimeout = (address: string): Promise<void> => {
  let timerId: ReturnType<typeof setTimeout>
  return Promise.race([
    (BluetoothManager.connect(address) as Promise<void>).then((v) => {
      clearTimeout(timerId)
      return v
    }),
    new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error('Tiempo de conexión agotado (10s)')),
        CONNECT_TIMEOUT_MS
      )
    })
  ])
}

const executePrint = async (order: PrintOrder): Promise<void> => {
  /* ---------- LOGO ---------- */
  await BluetoothEscposPrinter.printPic(logoBase64, {
    width: 300,
    left: 130
  })
  await new Promise<void>((resolve) => setTimeout(resolve, 1200))

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT)

  /* ---------- ENCABEZADO ---------- */
  const headerLines: string[] = []

  headerLines.push(`Comanda: ${order.order_number}`)

  if (order.table_name) {
    headerLines.push(`Mesa: ${normalizeTextForPrinter(order.table_name)}`)
  }

  if (order.customer_name) {
    headerLines.push(`Cliente: ${normalizeTextForPrinter(order.customer_name)}`)
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

    if (name.length <= columnWidths[0]) {
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
    } else {
      const lineWidth = columnWidths.reduce((a, b) => a + b, 0)
      const nameLines = wrapWords(name, lineWidth)
      for (const line of nameLines) {
        await BluetoothEscposPrinter.printText(`${line}\n`, fontConfig)
      }
      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT
        ],
        ['', quantity, price],
        fontConfig
      )
    }

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
  /* Dar tiempo a que la impresora vacíe su buffer antes de desconectar */
  await new Promise<void>((resolve) => setTimeout(resolve, 600))
}

const executePrintKitchen = async (order: PrintOrder): Promise<void> => {
  /* ---------- LOGO ---------- */
  await BluetoothEscposPrinter.printPic(logoBase64, {
    width: 300,
    left: 130
  })
  await new Promise<void>((resolve) => setTimeout(resolve, 1200))

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER)

  /* ---------- ENCABEZADO ---------- */
  await BluetoothEscposPrinter.printText(`#${order.order_number}\n`, fontConfig)

  if (order.table_name) {
    await BluetoothEscposPrinter.printText(
      `Mesa: ${normalizeTextForPrinter(order.table_name)}\n`,
      fontConfig
    )
  }

  if (order.customer_name) {
    await BluetoothEscposPrinter.printText(
      `Cliente: ${normalizeTextForPrinter(order.customer_name)}\n`,
      fontConfig
    )
  }

  await BluetoothEscposPrinter.printText(
    `${order.type === 'DINE_IN' ? 'Para aqui' : 'Para llevar'}\n`,
    fontConfig
  )

  await BluetoothEscposPrinter.printText('========================\n\n', {})

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT)

  /* ---------- ITEMS ---------- */
  for (const item of order.items) {
    const name = normalizeTextForPrinter(item.name)

    if (name.length <= 19) {
      await BluetoothEscposPrinter.printColumn(
        [5, 19],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT],
        [`x${item.quantity}`, name],
        fontConfig
      )
    } else {
      const prefix = `x${item.quantity} `
      const nameLines = wrapWords(name, 24 - prefix.length)
      await BluetoothEscposPrinter.printText(`${prefix}${nameLines[0]}\n`, fontConfig)
      const indent = ' '.repeat(prefix.length)
      for (const line of nameLines.slice(1)) {
        await BluetoothEscposPrinter.printText(`${indent}${line}\n`, fontConfig)
      }
    }

    if (item.notes?.trim()) {
      await BluetoothEscposPrinter.printText(
        `  >> ${normalizeTextForPrinter(item.notes)}\n`,
        fontConfig
      )
    }

    await BluetoothEscposPrinter.printText('\n', {})
  }

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER)

  await BluetoothEscposPrinter.printText('========================\n', {})

  await BluetoothEscposPrinter.printText('\n\n\n', {})
  await BluetoothEscposPrinter.cutOnePoint()
  /* Dar tiempo a que la impresora vacíe su buffer antes de desconectar */
  await new Promise<void>((resolve) => setTimeout(resolve, 600))
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

  const disconnect = async () => {
    try {
      await BluetoothManager.disconnect(printerAddress)
    } catch {
      /* ignorar */
    }
  }

  const attempt = async (): Promise<void> => {
    await connectWithTimeout(printerAddress)
    await executePrint(order)
    await disconnect()
  }

  /* Limpiar posible conexión colgada antes del primer intento */
  await disconnect()
  await new Promise<void>((resolve) => setTimeout(resolve, 400))

  try {
    await attempt()
    return { success: true }
  } catch (firstError: any) {
    console.warn(
      'Primer intento de impresión fallido, reintentando...',
      firstError?.message
    )
    await disconnect()
    await new Promise<void>((resolve) => setTimeout(resolve, 1500))

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

export const printKitchenOrder = async (
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

  const disconnect = async () => {
    try {
      await BluetoothManager.disconnect(printerAddress)
    } catch {
      /* ignorar */
    }
  }

  const attempt = async (): Promise<void> => {
    await connectWithTimeout(printerAddress)
    await executePrintKitchen(order)
    await disconnect()
  }

  /* Limpiar posible conexión colgada antes del primer intento */
  await disconnect()
  await new Promise<void>((resolve) => setTimeout(resolve, 400))

  try {
    await attempt()
    return { success: true }
  } catch (firstError: any) {
    console.warn(
      'Primer intento de impresión cocina fallido, reintentando...',
      firstError?.message
    )
    await disconnect()
    await new Promise<void>((resolve) => setTimeout(resolve, 1500))

    try {
      await attempt()
      return { success: true }
    } catch (secondError: any) {
      console.error('Segundo intento de impresión cocina fallido:', secondError)
      return {
        success: false,
        error: secondError?.message || 'Error desconocido al imprimir'
      }
    }
  }
}
