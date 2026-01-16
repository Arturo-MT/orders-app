import Skeleton from '@/app/components/Skeleton'
import { useWindowDimensions, View } from 'react-native'

export default function ProductGridSkeleton({ columns }: { columns: number }) {
  const { width } = useWindowDimensions()
  const cardWidth = width / columns - 12

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: cardWidth,
            paddingHorizontal: 6,
            paddingVertical: 6
          }}
        >
          <Skeleton width='100%' height={120} radius={16} />
        </View>
      ))}
    </View>
  )
}
