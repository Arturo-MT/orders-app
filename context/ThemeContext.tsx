import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme, Theme } from '@/constants/Colors'

type ThemeMode = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  mode: ThemeMode
  toggleTheme: () => void
}

const STORAGE_KEY = '@theme_mode'

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: 'light',
  toggleTheme: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') setMode(saved)
    })
  }, [])

  const toggleTheme = async () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light'
    setMode(next)
    await AsyncStorage.setItem(STORAGE_KEY, next)
  }

  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
