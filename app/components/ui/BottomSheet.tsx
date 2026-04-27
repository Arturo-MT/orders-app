import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import BottomSheetLib, {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export interface AppBottomSheetRef {
  open: () => void
  close: () => void
}

export const SHEET_SNAP: Record<string, (string | number)[]> = {
  editShort: ['42%', '70%'],
  editLong: ['55%', '92%'],
  form: ['60%', '92%'],
  list: ['50%', '85%']
}

interface AppBottomSheetProps {
  snapPoints?: (string | number)[]
  children: React.ReactNode
  onDismiss?: () => void
  onOpen?: () => void
  scrollable?: boolean
}

// Native implementation using @gorhom/bottom-sheet
const NativeBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  ({ snapPoints, children, onDismiss, onOpen, scrollable = false }, ref) => {
    const { theme } = useTheme()
    const sheetRef = useRef<BottomSheetModal>(null)
    const snaps = useMemo(() => snapPoints ?? ['60%', '90%'], [snapPoints])

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.present(),
      close: () => sheetRef.current?.dismiss()
    }))

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    )

    const styles = makeStyles(theme)

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={scrollable ? snaps : undefined}
        enableDynamicSizing={!scrollable}
        onDismiss={onDismiss}
        onChange={(index) => { if (index >= 0) onOpen?.() }}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
      >
        {scrollable ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={styles.content}>{children}</BottomSheetView>
        )}
      </BottomSheetModal>
    )
  }
)
NativeBottomSheet.displayName = 'NativeBottomSheet'

// Web fallback using RN Modal
const WebBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  ({ children, onDismiss }, ref) => {
    const { theme } = useTheme()
    const [visible, setVisible] = React.useState(false)
    const styles = makeStyles(theme)

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => {
        setVisible(false)
        onDismiss?.()
      }
    }))

    return (
      <Modal
        visible={visible}
        transparent
        animationType='slide'
        onRequestClose={() => {
          setVisible(false)
          onDismiss?.()
        }}
      >
        <TouchableOpacity
          style={styles.webOverlay}
          activeOpacity={1}
          onPress={() => {
            setVisible(false)
            onDismiss?.()
          }}
        />
        <View style={styles.webSheet}>{children}</View>
      </Modal>
    )
  }
)
WebBottomSheet.displayName = 'WebBottomSheet'

export const AppBottomSheet =
  Platform.OS === 'web' ? WebBottomSheet : NativeBottomSheet

// Re-export sheet primitives for use inside sheets
export { BottomSheetScrollView, BottomSheetLib }
export { BottomSheetTextInput } from '@gorhom/bottom-sheet'

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    background: {
      backgroundColor: theme.surface
    },
    handle: {
      backgroundColor: theme.border,
      width: 40
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32
    },
    webOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    webSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
      paddingTop: 12
    }
  })
