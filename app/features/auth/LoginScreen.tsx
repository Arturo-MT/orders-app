import React, { useState } from 'react'
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { Href, router } from 'expo-router'

export default function LoginScreen() {
  const { loginWithPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      await loginWithPassword({ email, password })
      setTimeout(() => {
        router.replace('/tabs/pos' as Href)
      }, 0)
    } catch (err) {
      console.error('Login error:', err)
      Alert.alert('Login fallido', 'Verifica tus credenciales')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        style={styles.input}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading ? 'Ingresando...' : 'Ingresar'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingHorizontal: 200,
    flex: 1,
    justifyContent: 'center'
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15
  }
})
