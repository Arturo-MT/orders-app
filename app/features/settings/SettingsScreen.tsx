import React from 'react'
import { View } from 'react-native'
import BluetoothSettings from './BluetoothSettings'

export default function SettingsScreen() {
  return (
    <View style={{ padding: 20, flex: 1, backgroundColor: '#ece2d0' }}>
      <BluetoothSettings />
    </View>
  )
}
