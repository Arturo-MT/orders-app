import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { Href, router } from 'expo-router'
import { useWindowDimensions } from 'react-native'

export default function LoginScreen() {
  const { loginWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { width, height } = useWindowDimensions()
  const isPortrait = height > width
  const containerStyle = [
    styles.container,
    { flexDirection: isPortrait ? ('column' as const) : ('row' as const) }
  ]

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
    <View style={containerStyle}>
      <Image
        source={require('../../../assets/images/icon.png')}
        style={styles.headerImage}
        resizeMode='contain'
      />

      <View style={styles.formContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          style={styles.input}
          placeholder='ejemplo@correo.com'
          placeholderTextColor='#aaa'
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder='********'
          placeholderTextColor='#aaa'
        />

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff'
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  headerImage: {
    height: 400,
    width: 400,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    textAlign: 'center',
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000'
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#aaa'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
