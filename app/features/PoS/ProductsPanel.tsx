import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import Card from '@/app/components/Card'
import { Product } from '@/types/types'

export default function ProductsPanel({
  categoriesList,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  productsList,
  isCategoriesLoading,
  isCategoriesRefetching,
  isProductsLoading,
  isProductsRefetching,
  handlePress
}: {
  categoriesList: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  filteredProducts: Product[]
  productsList: Product[]
  isCategoriesLoading: boolean
  isCategoriesRefetching: boolean
  isProductsLoading: boolean
  isProductsRefetching: boolean
  handlePress: (product: Product) => void
}) {
  return (
    <>
      <View style={styles.categorySelector}>
        {(isCategoriesLoading || isCategoriesRefetching) && (
          <ActivityIndicator size='large' color='#6200ea' />
        )}
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
          {(isProductsLoading || isProductsRefetching) && (
            <ActivityIndicator size='large' color='#6200ea' />
          )}
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
    </>
  )
}

const styles = StyleSheet.create({
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
    flex: 1
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10
  },
  card: {
    flexBasis: '25%'
  }
})
