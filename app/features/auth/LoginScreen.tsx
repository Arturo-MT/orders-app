import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
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

  const handleLogin = async () => {
    try {
      setLoading(true)
      await loginWithPassword({ email, password })
      router.replace('/tabs/pos' as Href)
    } catch (err) {
      Alert.alert('Login fallido', 'Verifica tus credenciales')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.container}>
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
                <ActivityIndicator color='#ece2d0' />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ECE2D0',
    justifyContent: 'center'
  },

  headerImage: {
    height: 220,
    width: 220,
    alignSelf: 'center',
    marginBottom: 24
  },

  formContainer: {
    width: '100%',
    alignSelf: 'center'
  },

  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#130918',
    fontWeight: '600'
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#130918',
    backgroundColor: '#fff'
  },

  button: {
    backgroundColor: '#f1aa1c',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8
  },

  buttonDisabled: {
    opacity: 0.6
  },

  buttonText: {
    color: '#130918',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
