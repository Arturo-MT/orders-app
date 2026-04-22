import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BREAKPOINTS } from '@/app/theme/tokens'

export function useOrientation() {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  return {
    isPortrait: height >= width,
    isSmall: width <= BREAKPOINTS.sm,
    isMedium: width <= BREAKPOINTS.md,
    width,
    height,
    insets,
  }
}

export function useFabBottomInset() {
  const insets = useSafeAreaInsets()
  return insets.bottom + 16
}
