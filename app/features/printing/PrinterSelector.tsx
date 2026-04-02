import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'
import { requestBluetoothPermissions } from './print'
import Skeleton from '@/app/components/Skeleton'
import { theme } from '@/constants/Colors'

export type Device = {
  name?: string
  address: string
}

interface Props {
  onSelect: (device: Device) => void
}

const parseDevices = (raw: any): Device[] => {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item)
          } catch {
            return null
          }
        }
        return item
      })
      .filter(Boolean)
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

export default function PrinterSelector({ onSelect }: Props) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  const scanDevices = async () => {
    const hasPermission = await requestBluetoothPermissions()
    if (!hasPermission) return

    setLoading(true)

    try {
      const result: any = await BluetoothManager.enableBluetooth()
      const parsedDevices = parseDevices(result)
      setDevices(parsedDevices)
    } catch (err) {
      console.error('Error escaneando dispositivos:', err)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    scanDevices()
  }, [])

  return (
    <View style={styles.container}>
      {loading && <Skeleton width='100%' height={40} />}

      {!loading && devices.length === 0 && (
        <Text style={styles.emptyText}>
          No se encontraron dispositivos Bluetooth
        </Text>
      )}

      {!loading &&
        devices.map((item) => (
          <TouchableOpacity
            key={item.address}
            style={styles.deviceButton}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.deviceName}>
              {item.name || 'Dispositivo sin nombre'}
            </Text>
            <Text style={styles.deviceAddress}>{item.address}</Text>
          </TouchableOpacity>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  },
  deviceButton: {
    backgroundColor: theme.borderLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600'
  },
  deviceAddress: {
    fontSize: 12,
    color: theme.textSecondary
  },
  emptyText: {
    textAlign: 'center',
    color: theme.textSecondary,
    marginTop: 20
  }
})
