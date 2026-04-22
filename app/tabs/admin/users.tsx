import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  useStoreMembersQuery,
  useCreateStoreMember,
  useUpdateStoreMember,
} from '@/hooks/api/store-members'
import Skeleton from '@/app/components/Skeleton'
import { useFocusEffect } from 'expo-router'
import { useAuth } from '@/app/context/AuthContext'
import { useTheme } from '@/app/context/ThemeContext'
import { Theme } from '@/constants/Colors'
import { AppBottomSheet, AppBottomSheetRef, BottomSheetTextInput } from '@/app/components/ui/BottomSheet'

interface UsersScreenProps {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  is_active: boolean
}

export default function UsersScreen() {
  const { user } = useAuth()
  const { data, isLoading, isRefetching, refetch } = useStoreMembersQuery()
  const { mutate: createMember, isPending: isCreating } = useCreateStoreMember()
  const { mutate: updateMember } = useUpdateStoreMember()
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const createSheetRef = useRef<AppBottomSheetRef>(null)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')

  const saveDisabled = !email.trim() || isCreating

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

  return (
    <View style={styles.container}>
      {(isLoading || isRefetching) && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width='100%' height={56} radius={12} />
          ))}
        </View>
      )}

      {!isLoading && !isRefetching && (
        <FlatList
          data={data}
          keyExtractor={(item: UsersScreenProps) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowText, !item.is_active && styles.rowTextDisabled]}>
                  {item.email}{user?.email === item.email ? ' (Tú)' : ''}
                </Text>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
              <View style={styles.rowActions}>
                <Switch
                  value={item.is_active}
                  disabled={item.email === user?.email}
                  onValueChange={(value) => updateMember({ id: item.id, is_active: value })}
                  style={{
                    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                    opacity: item.email === user?.email ? 0.6 : 1
                  }}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={item.is_active ? theme.textPrimary : theme.borderLight}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No hay usuarios asignados</Text>}
        />
      )}

      <Pressable style={styles.fab} onPress={() => createSheetRef.current?.open()}>
        <Ionicons name='add' size={32} color={theme.surface} />
      </Pressable>

      {/* Add user sheet */}
      <AppBottomSheet
        ref={createSheetRef}
        snapPoints={['60%', '95%']}
        onDismiss={() => { setEmail(''); setRole('staff') }}
      >
        <Text style={styles.sheetTitle}>Agregar usuario</Text>
        <BottomSheetTextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          placeholderTextColor={theme.textMuted}
          autoCapitalize='none'
          keyboardType='email-address'
          style={styles.input}
          returnKeyType='done'
        />
        <View style={styles.roleSelector}>
          <Pressable
            onPress={() => setRole('staff')}
            style={[styles.roleOption, role === 'staff' && styles.roleSelected]}
          >
            <Text style={styles.roleOptionText}>Staff</Text>
          </Pressable>
          <Pressable
            onPress={() => setRole('admin')}
            style={[styles.roleOption, role === 'admin' && styles.roleSelected]}
          >
            <Text style={styles.roleOptionText}>Admin</Text>
          </Pressable>
        </View>
        <View style={styles.actionsRight}>
          <Pressable onPress={() => createSheetRef.current?.close()}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={saveDisabled}
            onPress={() => {
              createMember(
                { email, role },
                { onSuccess: () => { setEmail(''); setRole('staff'); createSheetRef.current?.close() } }
              )
            }}
          >
            <Text style={[styles.save, saveDisabled && styles.saveDisabled]}>
              {isCreating ? 'Agregando...' : 'Agregar'}
            </Text>
          </Pressable>
        </View>
      </AppBottomSheet>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    empty: { textAlign: 'center', marginTop: 40, color: theme.textSecondary },
    row: {
      backgroundColor: theme.surface, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    rowLeft: { flex: 1 },
    rowText: { fontSize: 16, color: theme.textPrimary },
    rowTextDisabled: { color: theme.textMuted },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roleText: { fontSize: 13, color: theme.textSecondary },
    fab: {
      position: 'absolute', right: 16, bottom: 16,
      backgroundColor: theme.textPrimary, width: 56, height: 56,
      borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 3
    },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 16 },
    input: {
      borderWidth: 1, borderColor: theme.border, borderRadius: 12,
      padding: 12, backgroundColor: theme.background, color: theme.textPrimary,
      marginBottom: 12,
    },
    roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    roleOption: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.borderLight, alignItems: 'center' },
    roleSelected: { backgroundColor: theme.primary },
    roleOptionText: { fontWeight: '600', color: theme.textOnPrimary },
    actionsRight: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 12 },
    cancel: { color: theme.textPrimary, fontSize: 16 },
    save: {
      color: theme.textOnPrimary, fontSize: 16, fontWeight: '600',
      backgroundColor: theme.primary, padding: 8, borderRadius: 6
    },
    saveDisabled: { opacity: 0.6 }
  })
