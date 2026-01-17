import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'
import { requestBluetoothPermissions } from './print'
import { Device } from '@/types/types'
import Skeleton from '@/app/components/Skeleton'

interface Props {
  onSelect: (device: Device) => void
}

export default function PrinterSelector({ onSelect }: Props) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  const scanDevices = async () => {
    const hasPermission = await requestBluetoothPermissions()
    if (!hasPermission) return

    setLoading(true)
    try {
      let result: any = await BluetoothManager.scanDevices()

      if (typeof result === 'string') {
        try {
          result = JSON.parse(result)
        } catch (err) {
          console.error('Error parseando respuesta de scanDevices:', err)
          result = {}
        }
      }

      const pairedRaw = result?.paired
      let paired: any[] = []

      if (typeof pairedRaw === 'string') {
        try {
          paired = JSON.parse(pairedRaw)
        } catch (err) {
          console.error('Error parseando paired:', err)
        }
      } else if (Array.isArray(pairedRaw)) {
        paired = pairedRaw
      } else {
        console.warn('Formato inesperado en paired:', pairedRaw)
      }

      setDevices(paired)
    } catch (err) {
      console.error('Error escaneando dispositivos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    scanDevices()
  }, [])

  const renderItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceButton}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.deviceText}>
        {item.name || 'Sin nombre'}
        {'\n' /* Salto de línea */}
        {item.address}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {loading ? (
        <Skeleton width={'100%'} height={40} />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.address}
          renderItem={renderItem}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  deviceButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  deviceText: {
    fontSize: 16
  }
})
