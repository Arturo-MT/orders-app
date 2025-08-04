import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, ToastAndroid } from 'react-native'
import { useCategoriesQuery } from '@/hooks/api/categories'
import { useProductsQuery } from '@/hooks/api/products'
import { useUserQuery } from '@/hooks/api/users'
import { useOrdersMutation } from '@/hooks/api/orders'
import { useFocusEffect } from '@react-navigation/native'
import {
  Category,
  Order,
  OrderResponse,
  Product,
  ProductData
} from '@/types/types'
import { printOrder } from '../printing/print'
import ProductsPanel from './ProductsPanel'
import OrderPanel from './OrderPanel'
import { useWindowDimensions } from 'react-native'
import { useStoreQuery } from '@/hooks/api/store'

export default function PosScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [total, setTotal] = useState(0)
  const [order, setOrder] = useState<Order>({
    customer_name: '',
    type: 'F',
    items: [],
    order_number: ''
  })

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: categoriesRefetch,
    isRefetching: isCategoriesRefetching
  } = useCategoriesQuery()

  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch: productsRefetch,
    isRefetching: isProductsRefetching
  } = useProductsQuery()

  const { data: userData, refetch: userRefetch } = useUserQuery()
  const { data: storeData } = useStoreQuery()
  const { mutate: createOrder } = useOrdersMutation({
    retry: 1,
    retryDelay: 1000
  })

  const categoriesList: string[] = [
    'Todos',
    ...(categoriesData?.map((category: { name: string }) => category.name) ||
      [])
  ]

  const productsList: Product[] =
    productsData?.map((product: ProductData) => ({
      id: product.id,
      name: product.name,
      category:
        categoriesData?.find((c: Category) => c.id === product.category)
          ?.name || '',
      price: product.price
    })) || []

  const filteredProducts =
    selectedCategory === 'Todos'
      ? productsList
      : productsList.filter((p) => p.category === selectedCategory)

  const { width, height } = useWindowDimensions()

  const isPortrait = height >= width
  const containerStyle = [
    styles.container,
    { flexDirection: isPortrait ? ('column' as const) : ('row' as const) }
  ]

  useEffect(() => {
    const total = order.items.reduce(
      (acc, item) => acc + parseFloat(item.price.toString()) || 0,
      0
    )
    setTotal(total)
  }, [order])

  const handleAddProduct = (product: Product) => {
    setOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length,
          name: product.name,
          product: product.id,
          quantity: 1,
          price: product.price,
          basePrice: product.price,
          comment: ''
        }
      ]
    }))
  }

  const buildOrderPayload = (order: Order) => {
    const storeId = userData?.store
    if (!storeId || order.items.length === 0 || !order.customer_name)
      return null
    return {
      customer_name: order.customer_name,
      type: order.type,
      store: storeId,
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
  }

  const handlePrintOrder = async () => {
    const payload = buildOrderPayload(order)

    if (!payload) {
      ToastAndroid.show(
        'Datos incompletos para guardar la orden',
        ToastAndroid.SHORT
      )
      return
    }

    try {
      const responseData: OrderResponse = await new Promise(() =>
        createOrder(payload)
      )

      ToastAndroid.show('Orden enviada correctamente', ToastAndroid.SHORT)

      try {
        await printOrder(responseData as Order, storeData.printer_address)

        ToastAndroid.show('🖨 Orden impresa correctamente', ToastAndroid.SHORT)
      } catch (err) {
        console.warn('Error al imprimir:', err)
        ToastAndroid.show(
          '⚠️ No se pudo imprimir el ticket',
          ToastAndroid.SHORT
        )
      }

      setOrder({
        customer_name: '',
        type: 'F',
        items: [],
        order_number: ''
      })
    } catch (err) {
      console.error('🚫 Fallo al enviar orden:', err)
      ToastAndroid.show(
        '❌ Fallo al enviar orden, reintente si es posible',
        ToastAndroid.SHORT
      )
    }
  }

  useFocusEffect(
    useCallback(() => {
      categoriesRefetch()
      productsRefetch()
      userRefetch()
    }, [categoriesRefetch, productsRefetch, userRefetch])
  )

  return (
    <View style={containerStyle}>
      <ProductsPanel
        categoriesList={categoriesList}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredProducts={filteredProducts}
        productsList={productsList}
        isCategoriesLoading={isCategoriesLoading}
        isCategoriesRefetching={isCategoriesRefetching}
        isProductsLoading={isProductsLoading}
        isProductsRefetching={isProductsRefetching}
        handlePress={handleAddProduct}
      />

      <OrderPanel
        order={order}
        total={total}
        onChange={setOrder}
        onPrint={handlePrintOrder}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0'
  }
})
