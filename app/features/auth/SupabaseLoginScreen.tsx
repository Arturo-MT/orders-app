import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export default function SupabaseAuthScreen() {
  const { theme } = useTheme()
  const styles = makeStyles(theme)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const login = async () => {
    try {
      setLoading(true)
      setError('')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return }
      router.replace('/tabs/pos')
    } catch {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const signup = async () => {
    try {
      setLoading(true)
      setError('')
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); return }
      setMode('login')
      setInfo('Cuenta creada. Espera a que un administrador te asigne una tienda.')
    } catch {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const disabled =
    loading || !email.trim() || !password.trim() ||
    (mode === 'signup' && !confirmPassword.trim())

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Accede a tu cuenta' : 'Registra una nueva cuenta'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          placeholderTextColor={theme.textMuted}
          autoCapitalize='none'
          keyboardType='email-address'
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder='Contraseña'
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          style={styles.input}
        />

        {mode === 'signup' && (
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='Confirmar contraseña'
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            style={styles.input}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={mode === 'login' ? login : signup}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Login' : 'Crear cuenta'}
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.link}>
            {mode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 24, gap: 12 },
    title: { fontSize: 22, fontWeight: '600', color: theme.textPrimary },
    subtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 12 },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: theme.background,
      color: theme.textPrimary
    },
    button: { backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: theme.textOnPrimary, fontSize: 16, fontWeight: '800' },
    link: { marginTop: 12, textAlign: 'center', color: theme.textPrimary, fontWeight: '600' },
    error: { color: theme.destructive, textAlign: 'center' },
    info: { color: theme.success, textAlign: 'center' }
  })
