import { Order } from '@/types/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ToastAndroid } from 'react-native'

export const syncPendingOrders = async (createOrder: any) => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const pendingKeys = keys.filter((key) => key.startsWith('pending-order-'))

    pendingKeys.sort()

    for (const key of pendingKeys) {
      const raw = await AsyncStorage.getItem(key)
      if (!raw) continue

      const order: Order = JSON.parse(raw)
      const payload = {
        customer_name: order.customer_name,
        type: order.type,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          basePrice: item.basePrice,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          description: item.description || ''
        }))
      }

      try {
        await new Promise((resolve, reject) =>
          createOrder(payload, {
            onSuccess: resolve,
            onError: reject
          })
        )
        await AsyncStorage.removeItem(key)
        ToastAndroid.show(
          `Orden ${order.order_number} sincronizada`,
          ToastAndroid.SHORT
        )
      } catch (err) {
        console.warn(`No se pudo sincronizar ${key}:`, err)
      }
    }
  } catch (err) {
    console.error('Error al sincronizar órdenes locales:', err)
  }
}
