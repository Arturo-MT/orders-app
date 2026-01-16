import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'

export default function SupabaseLoginScreen() {
  const [loading, setLoading] = useState(false)

  const login = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ingatorrez@gmail.com',
        password: 'Co0p3r$1267'
      })

      console.log(data, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>

        {/* Más adelante aquí van los inputs */}
        {/* TextInput email */}
        {/* TextInput password */}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={login}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Login'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE2D0',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#1F3A5F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500'
  }
})
