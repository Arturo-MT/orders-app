export const lightTheme = {
  // Fondos
  background: '#f5efe6',
  surface: '#ffffff',

  // Acciones
  primary: '#f1aa1c',
  primaryMuted: '#e0c46c',
  destructive: '#C0503F',
  success: '#5A7A52',

  // Texto
  textPrimary: '#130918',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Bordes y separadores
  border: '#dddddd',
  borderLight: '#eeeeee',

  // Estados deshabilitados
  disabled: '#e0e0e0',
  disabledText: '#999999',

  // Overlay modal
  overlay: 'rgba(0,0,0,0.4)',
} as const

export const darkTheme = {
  // Fondos
  background: '#0f0f0f',
  surface: '#1c1c1e',

  // Acciones
  primary: '#f1aa1c',
  primaryMuted: '#b8862a',
  destructive: '#C0503F',
  success: '#5A7A52',

  // Texto
  textPrimary: '#f2f2f7',
  textSecondary: '#aeaeb2',
  textMuted: '#636366',

  // Bordes y separadores
  border: '#3a3a3c',
  borderLight: '#2c2c2e',

  // Estados deshabilitados
  disabled: '#3a3a3c',
  disabledText: '#636366',

  // Overlay modal
  overlay: 'rgba(0,0,0,0.6)',
} as const

export type Theme = typeof lightTheme

// Alias para los archivos que aún no se han migrado al contexto
export const theme = lightTheme
