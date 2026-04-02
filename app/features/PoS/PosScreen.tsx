import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  ToastAndroid,
  useWindowDimensions,
  ViewStyle
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { useCategoriesQuery } from '@/hooks/api/categories'
import { useProductsQuery } from '@/hooks/api/products'
import { useUserQuery } from '@/hooks/api/users'
import { useCreateOrder } from '@/hooks/api/orders'
import { useStoreQuery } from '@/hooks/api/store'

import { OrderDraft, OrderItemDraft, Product } from '@/types/types'
import { printOrder } from '../printing/print'

import { theme } from '@/constants/Colors'
import ProductsPanel from './ProductsPanel'
import OrderPanel from './OrderPanel'

export default function PosScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [total, setTotal] = useState(0)

  const [order, setOrder] = useState<OrderDraft>({
    type: 'TAKEAWAY',
    table_id: null,
    customer_name: '',
    table_name: '',
    is_paid: false,
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

  const { refetch: userRefetch } = useUserQuery()
  const { data: storeData } = useStoreQuery()

  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    retry: 1,
    retryDelay: 1000
  })

  /* ---------- productos ---------- */

  const categoriesList: string[] = [
    'Todos',
    ...(categoriesData?.map((c) => c.name) ?? [])
  ]

  const productsList: Product[] =
    productsData
      ?.filter((p) => categoriesData?.some((c) => c.id === p.category_id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category:
          categoriesData?.find((c) => c.id === p.category_id)?.name ?? '',
        price: p.price
      })) ?? []

  const filteredProducts =
    selectedCategory === 'Todos'
      ? productsList
      : productsList.filter((p) => p.category === selectedCategory)

  /* ---------- layout ---------- */

  const { width, height } = useWindowDimensions()
  const isPortrait = height >= width

  const containerStyle: ViewStyle[] = [
    styles.container,
    {
      flexDirection: isPortrait ? 'column' : 'row'
    }
  ]

  /* ---------- total ---------- */

  useEffect(() => {
    const sum = order.items.reduce((acc, item) => acc + item.price, 0)
    setTotal(sum)
  }, [order.items])

  /* ---------- acciones ---------- */

  const handleAddProduct = (product: Product) => {
    setOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          uid: `${Date.now()}-${product.id}`,
          product_id: product.id,
          name: product.name,
          base_price: product.price,
          price: product.price,
          quantity: 1
        } satisfies OrderItemDraft
      ]
    }))
  }

  const buildOrderPayload = (draft: OrderDraft): OrderDraft | null => {
    if (draft.items.length === 0) return null

    const hasTable = draft.table_id !== null
    const hasCustomerName = !!draft.customer_name?.trim()

    if (!hasTable && !hasCustomerName) {
      return null
    }

    return draft
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
      const response = await createOrder(payload)

      ToastAndroid.show('Orden creada correctamente', ToastAndroid.SHORT)

      const { success: printSuccess, error: printError } = await printOrder(
        {
          order_number: response.order_number,
          type: order.type,
          customer_name: order.customer_name,
          table_name: order.table_name,
          is_paid: order.is_paid ?? false,
          items: order.items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.base_price,
              notes: i.notes
            }))
        },
        storeData?.printer_address
      )

      if (printSuccess) {
        ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
      } else {
        ToastAndroid.show(`Error al imprimir: ${printError}`, ToastAndroid.SHORT)
      }

      // reset limpio
      setOrder({
        type: 'TAKEAWAY',
        table_id: null,
        customer_name: '',
        table_name: '',
        is_paid: false,
        items: []
      })
    } catch (error) {
      console.error('🚫 Error al crear orden:', error)
      ToastAndroid.show('❌ Fallo al crear la orden', ToastAndroid.SHORT)
    }
  }

  /* ---------- refetch ---------- */

  useFocusEffect(
    useCallback(() => {
      categoriesRefetch()
      productsRefetch()
      userRefetch()
    }, [categoriesRefetch, productsRefetch, userRefetch])
  )

  /* ---------- render ---------- */

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
        isLoading={isCreatingOrder}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.background
  }
})
