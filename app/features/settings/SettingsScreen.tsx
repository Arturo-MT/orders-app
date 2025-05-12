import React from 'react'
import { View } from 'react-native'
import BluetoothSettings from './BluetoothSettings'

export default function SettingsScreen() {
  return (
    <View style={{ padding: 20 }}>
      <BluetoothSettings />
    </View>
  )
}
