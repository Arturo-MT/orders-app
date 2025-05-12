import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, ToastAndroid } from 'react-native'
import { useCategoriesQuery } from '@/hooks/api/categories'
import { useProductsQuery } from '@/hooks/api/products'
import { useUserQuery } from '@/hooks/api/users'
import { useOrdersMutation } from '@/hooks/api/orders'
import { useFocusEffect } from '@react-navigation/native'
import { Category, Order, Product, ProductData } from '@/types/types'
import { printOrder } from '../printing/print'
import ProductsPanel from './ProductsPanel'
import OrderPanel from './OrderPanel'

export default function PosScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [total, setTotal] = useState(0)
  const [order, setOrder] = useState<Order>({
    customer_name: '',
    type: 'F',
    items: []
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
  const { mutate: createOrder } = useOrdersMutation()

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

  useEffect(() => {
    const total = order.items.reduce(
      (acc, item) => acc + item.basePrice * item.quantity,
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
    const orderPayload = buildOrderPayload(order)
    const success = await printOrder(order)
    if (success) {
      if (orderPayload) {
        createOrder(orderPayload, {
          onSuccess: () => {
            ToastAndroid.show('Orden creada correctamente', ToastAndroid.SHORT)
          },
          onError: (error) => {
            console.error('Error al crear la orden:', error)
            ToastAndroid.show('Error al crear la orden', ToastAndroid.SHORT)
          }
        })
      }
      setOrder({ customer_name: '', type: 'F', items: [] })
      ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
    } else {
      ToastAndroid.show('Error al imprimir la orden', ToastAndroid.SHORT)
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
    <View style={styles.container}>
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
