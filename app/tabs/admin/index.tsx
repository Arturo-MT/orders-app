import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function AdminHomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <Pressable
          style={styles.card}
          onPress={() => router.push('/tabs/admin/categories')}
        >
          <Ionicons name='folder-outline' size={36} color='#130918' />
          <Text style={styles.title}>Categorías</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/tabs/admin/products')}
        >
          <Ionicons name='cube-outline' size={36} color='#130918' />
          <Text style={styles.title}>Productos</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/tabs/admin/tables')}
        >
          <Ionicons name='restaurant-outline' size={36} color='#130918' />
          <Text style={styles.title}>Mesas</Text>
        </Pressable>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece2d0',
    padding: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  card: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 2
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#130918',
    textAlign: 'center'
  }
})
