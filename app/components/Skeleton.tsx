import { StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

export default function Skeleton({
  width,
  height,
  radius = 8
}: {
  width: number | string
  height: number
  radius?: number
}) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: typeof width === 'string' ? width : width,
          height,
          borderRadius: radius,
          opacity
        } as any
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#f1aa1c'
  }
})
