import React, { forwardRef, useState } from 'react'
import { TextInput, TextInputProps, View, ViewStyle, StyleSheet } from 'react-native'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export type InputVariant = 'text' | 'numeric' | 'multiline'

interface InputProps extends Omit<TextInputProps, 'keyboardType' | 'multiline'> {
  variant?: InputVariant
  containerStyle?: ViewStyle
  // Pass BottomSheetTextInput when the input lives inside a bottom sheet
  InputComponent?: React.ComponentType<TextInputProps>
}

export const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const { variant = 'text', containerStyle, InputComponent, style, onFocus, onBlur, ...rest } = props
  const { theme } = useTheme()
  const [focused, setFocused] = useState(false)
  const styles = makeStyles(theme, focused)
  const Comp = (InputComponent ?? TextInput) as unknown as typeof TextInput

  const keyboardType = variant === 'numeric' ? 'decimal-pad' : 'default'
  const isMultiline = variant === 'multiline'

  return (
    <View style={[styles.container, containerStyle]}>
      <Comp
        ref={ref}
        keyboardType={keyboardType}
        multiline={isMultiline}
        onFocus={(e) => { setFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, isMultiline && styles.multiline, style]}
        {...rest}
      />
    </View>
  )
})

Input.displayName = 'Input'

const makeStyles = (theme: Theme, focused: boolean) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: focused ? theme.primary : theme.border,
      borderRadius: 8,
      backgroundColor: theme.surface,
      paddingHorizontal: 8,
      justifyContent: 'center',
    },
    input: {
      color: theme.textPrimary,
      fontSize: 14,
      paddingVertical: 6,
      minHeight: 32,
    },
    multiline: {
      textAlignVertical: 'top',
      minHeight: 36,
    },
  })
