import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native'
import Card from '@/app/components/Card'
import { printOrder } from '../printing/print'
import OrderItemComponent from '../../components/OrderItemComponent'
import { useCategoriesQuery } from '@/hooks/api/categories'
import { useProductsQuery } from '@/hooks/api/products'
import CustomCheckbox from '@/app/components/CustomCheckbox'
import { useUserQuery } from '@/hooks/api/users'
import { Category, Order, OrderItem, Product, ProductData } from '@/types/types'
import { useOrdersMutation } from '@/hooks/api/orders'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

export default function PosScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [total, setTotal] = useState(0)
  const [order, setOrder] = useState<Order>({
    customer_name: '',
    type: 'F',
    items: [] as OrderItem[]
  })

  useFocusEffect(
    useCallback(() => {
      categoriesRefetch()
      productsRefetch()
      userRefecth()
    }, [])
  )

  useEffect(() => {
    const total = order.items.reduce((acc, item) => {
      return acc + item.basePrice * item.quantity
    }, 0)
    setTotal(total)
  }, [order])

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

  const { data: userData, refetch: userRefecth } = useUserQuery()

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
        categoriesData?.find(
          (category: Category) => category.id === product.category
        )?.name || '',
      price: product.price
    })) || []

  const filteredProducts =
    selectedCategory === 'Todos'
      ? productsList
      : productsList.filter((product) => product.category === selectedCategory)

  const handlePress = (product: Product) => {
    setOrder((prev) => {
      const newItem = {
        id: prev.items.length,
        name: product.name,
        product: product.id,
        quantity: 1,
        price: product.price,
        basePrice: product.price,
        comment: ''
      }

      return {
        ...prev,
        items: [...prev.items, newItem]
      }
    })
  }

  const handleUpdateItem = (index: number, updates: Partial<OrderItem>) => {
    setOrder((prev) => {
      const updatedItems = [...prev.items]
      updatedItems[index] = { ...updatedItems[index], ...updates }
      return { ...prev, items: updatedItems }
    })
  }

  const handleRemoveItem = (index: number) => {
    setOrder((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index)
      return { ...prev, items: updatedItems }
    })
  }

  const buildOrderPayload = (order: Order) => {
    const storeId = userData?.store
    if (!storeId) {
      console.error('No se encontró el ID de la tienda')
      return null
    }
    if (order.items.length === 0) {
      console.error('No hay productos en la orden')
      return null
    }
    if (!order.customer_name) {
      console.error('No se encontró el nombre del cliente')
      return null
    }
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
      if (orderPayload != null) {
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

      setOrder({
        customer_name: '',
        type: 'F',
        items: []
      })
      ToastAndroid.show('Orden impresa correctamente', ToastAndroid.SHORT)
    } else {
      console.error('Error al imprimir la orden')
      ToastAndroid.show('Error al imprimir la orden', ToastAndroid.SHORT)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.categorySelector}>
        {isCategoriesLoading ||
          (isCategoriesRefetching && (
            <ActivityIndicator size='large' color='#6200ea' />
          ))}
        {!isCategoriesLoading &&
          !isCategoriesRefetching &&
          categoriesList.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.productsWrapper}>
        <ScrollView contentContainerStyle={styles.productsContainer}>
          {isProductsLoading ||
            (isProductsRefetching && (
              <ActivityIndicator size='large' color='#6200ea' />
            ))}
          {!isProductsLoading && filteredProducts.length === 0 && (
            <Text style={{ fontSize: 16, color: '#000' }}>
              No hay productos en esta categoría
            </Text>
          )}
          {!isProductsLoading &&
            !isProductsRefetching &&
            filteredProducts.length > 0 &&
            productsList.length > 0 &&
            filteredProducts.map((item) => (
              <View key={item.id} style={styles.card}>
                <Card
                  data={item}
                  onPress={() => handlePress(item)}
                  _hiddenFields={['id', 'category']}
                />
              </View>
            ))}
        </ScrollView>
      </View>

      <View style={styles.orderWrapper}>
        <View style={styles.typeOrderWrapper}>
          <Text>Para llevar:</Text>
          <CustomCheckbox
            value={order.type === 'T'}
            onChange={() => setOrder({ ...order, type: 'T' })}
          />
          <Text>Para comer aquí:</Text>
          <CustomCheckbox
            value={order.type === 'F'}
            onChange={() => setOrder({ ...order, type: 'F' })}
          />
        </View>
        <TextInput
          placeholder='Nombre del cliente'
          style={styles.customerNameInput}
          onChangeText={(text) => setOrder({ ...order, customer_name: text })}
          value={order.customer_name}
        />
        <Text style={styles.orderTitle}>Total: ${total}</Text>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            onPress={handlePrintOrder}
            style={{
              flex: 1,
              backgroundColor:
                order.items.length === 0 || order.customer_name == ''
                  ? '#ccc'
                  : '#6200ea',
              padding: 10,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: order.items.length === 0 ? 0.6 : 1
            }}
            disabled={order.items.length === 0}
          >
            <Ionicons
              name='print'
              size={22}
              color='#fff'
              style={{ marginRight: 6 }}
            />
            <Text style={styles.printButtonText}>Imprimir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                '¿Limpiar orden?',
                'Esta acción eliminará todos los productos de la orden actual.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Limpiar',
                    onPress: () => {
                      setOrder({
                        customer_name: '',
                        type: 'F',
                        items: []
                      })
                      ToastAndroid.show('Orden limpiada', ToastAndroid.SHORT)
                    },
                    style: 'destructive'
                  }
                ]
              )
            }}
            style={{
              padding: 10,
              backgroundColor: order.items.length === 0 ? '#ccc' : '#e53935',
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: order.items.length === 0 ? 0.6 : 1
            }}
            disabled={order.items.length === 0}
          >
            <Ionicons name='trash' size={22} color='#fff' />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView contentContainerStyle={styles.orderItemContainer}>
            {order.items.map((item, index) => (
              <OrderItemComponent
                key={index}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={() => handleRemoveItem(item.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
    padding: 10
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0'
  },
  selectedCategory: {
    backgroundColor: '#6200ea'
  },
  categoryText: {
    fontSize: 16,
    color: '#000'
  },
  selectedCategoryText: {
    color: '#fff'
  },
  productsWrapper: {
    height: 400
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10
  },
  card: {
    flexBasis: '25%'
  },
  orderWrapper: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0'
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  scrollWrapper: {
    flex: 1
  },
  orderItemContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexGrow: 1
  },
  orderItem: {
    fontSize: 16,
    marginTop: 5
  },
  typeOrderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginVertical: 10,
    gap: 10
  },
  printButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  buttonsWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
    alignItems: 'center'
  },
  customerNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }
})
