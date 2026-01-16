import Skeleton from '@/app/components/Skeleton'
import { View } from 'react-native'

export default function CategorySkeleton() {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} width={90} height={40} radius={20} />
      ))}
    </View>
  )
}
