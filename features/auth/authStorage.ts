import * as SecureStore from 'expo-secure-store'

export const AUTH_STORAGE_KEY = 'TL_AUTH'

export type StoredAuth = {
  access: string
  refresh: string
}

export const getAuth = async (): Promise<StoredAuth | null> => {
  const stored = await SecureStore.getItemAsync(AUTH_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

export const setAuth = async (auth: StoredAuth) => {
  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export const clearAuth = async () => {
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY)
}
