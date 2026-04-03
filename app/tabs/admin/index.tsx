import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'

export default function AdminHomeScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <Pressable style={styles.card} onPress={() => router.push('/tabs/admin/categories')}>
          <Ionicons name='folder-outline' size={36} color={theme.textPrimary} />
          <Text style={styles.title}>Categorías</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/tabs/admin/products')}>
          <Ionicons name='cube-outline' size={36} color={theme.textPrimary} />
          <Text style={styles.title}>Productos</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/tabs/admin/tables')}>
          <Ionicons name='restaurant-outline' size={36} color={theme.textPrimary} />
          <Text style={styles.title}>Mesas</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/tabs/admin/users')}>
          <Ionicons name='people-outline' size={36} color={theme.textPrimary} />
          <Text style={styles.title}>Usuarios</Text>
        </Pressable>
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    card: {
      width: '31%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      elevation: 2
    },
    title: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, textAlign: 'center' }
  })
