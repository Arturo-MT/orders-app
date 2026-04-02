import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/Colors'

type ToastType = 'success' | 'error'

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('success')
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(16)).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback(
    (msg: string, t: ToastType = 'success') => {
      if (timer.current) clearTimeout(timer.current)

      setMessage(msg)
      setType(t)
      opacity.setValue(0)
      translateY.setValue(16)

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true })
      ]).start()

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 16, duration: 200, useNativeDriver: true })
        ]).start()
      }, 2500)
    },
    [opacity, translateY]
  )

  const bg = type === 'success' ? theme.success : theme.destructive
  const icon = type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents='none'
        style={[styles.toast, { backgroundColor: bg, opacity, transform: [{ translateY }] }]}
      >
        <Ionicons name={icon} size={18} color='#fff' />
        <Text style={styles.text} numberOfLines={2}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 8,
    zIndex: 999
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1
  }
})
