// theme/colors.ts
// Paleta inspirada en ARC Raiders (arena + azul táctico)

export const colors = {
  // Fondo principal
  background: '#F4E9C9', // amarillo-crema / arena

  // Superficies (cards, panels, modals)
  surface: '#0E2A47', // azul oscuro principal
  surfaceSoft: '#173B63', // azul ligeramente más claro
  surfaceMuted: '#1F456E', // para hover / pressed / secundarios

  // Texto
  textPrimary: '#0E2A47', // texto sobre fondo claro
  textOnDark: '#F4E9C9', // texto sobre superficies oscuras
  textMuted: '#C9BE9C', // texto secundario sobre fondo oscuro

  // Acciones / énfasis
  accent: '#F2B705', // amarillo intenso (CTA)
  accentSoft: '#FFD866', // hover / pressed
  accentText: '#1A1A1A', // texto sobre amarillo

  // Estados
  success: '#1E7F5C', // verde oscuro
  warning: '#C98A00', // amarillo quemado
  danger: '#B3261E', // rojo profundo

  // Bordes / divisores
  borderOnLight: '#D6CBA8', // líneas sutiles sobre fondo claro
  borderOnDark: '#2B4F73', // líneas sobre azul

  // Utilidades
  disabled: '#9C9275', // botones deshabilitados
  overlay: 'rgba(14,42,71,0.6)' // modales / overlays
} as const
